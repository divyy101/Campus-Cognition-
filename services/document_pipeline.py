"""
Campus Cognition V2 — Document Pipeline Service
Handles processing of uploaded documents.
On Vercel: processes synchronously (no background threads).
Locally: uses ThreadPoolExecutor for async processing.
"""
import os
import threading
import logging
import json
from concurrent.futures import ThreadPoolExecutor

from services.document_processor import process_document
from services.document_chunker import chunk_document
from services.embedding_service import generate_text_embedding
from database.repositories.document_repository import (
    update_document_status, get_document, create_document, save_chunks
)
from services.ai_service import analyze_study_materials
from database.repositories.study_repository import (
    create_study_session, save_study_analysis, save_topic_frequency, save_study_roadmap
)

logger = logging.getLogger(__name__)

# Only use thread pool locally — Vercel kills background threads after response
executor = ThreadPoolExecutor(max_workers=2)


def is_vercel() -> bool:
    """Check if running in Vercel serverless environment."""
    return os.environ.get('VERCEL') == '1'


def _process_document_background(doc_id: str, filepath: str, title: str, scope: str, ai_engine: str):
    """Process a document: extract text, run AI analysis, chunk/index."""
    try:
        # 1. EXTRACTING
        update_document_status(doc_id, status='EXTRACTING')
        _, extracted_text = process_document(filepath)

        if not extracted_text or len(extracted_text.strip()) < 50:
            update_document_status(doc_id, status='FAILED')
            logger.error(f"Document {doc_id}: extracted text too short or empty.")
            return

        # 2. ANALYZING
        update_document_status(doc_id, status='ANALYZING')

        result = analyze_study_materials(
            syllabus_text=extracted_text[:30000],
            notes_text="",
            subject_name=title,
            scope=scope,
            ai_engine=ai_engine
        )

        if not result.get('success'):
            update_document_status(doc_id, status='FAILED')
            logger.error(f"Document {doc_id}: AI analysis returned failure.")
            return

        # Save study session
        session_id = create_study_session(doc_id, title)
        important_topics = result.get('important_questions', [])
        study_priority = result.get('repeated_topics', [])
        weekly_plan = result.get('weekly_plan', [])

        save_study_analysis(
            session_id,
            json.dumps(important_topics),
            json.dumps(study_priority),
            json.dumps(weekly_plan),
            json.dumps(result)
        )

        try:
            save_topic_frequency(doc_id, session_id, study_priority)
            save_study_roadmap(doc_id, session_id, weekly_plan)
        except Exception as e:
            logger.warning(f"Non-critical: failed to save topic/roadmap data: {e}")

        # 3. CHUNKING
        update_document_status(doc_id, status='CHUNKING')
        try:
            chunks = chunk_document(doc_id, extracted_text)
        except Exception as e:
            logger.warning(f"Chunking failed (non-critical): {e}")
            chunks = []

        # 4. INDEXING (embeddings)
        if chunks:
            update_document_status(doc_id, status='INDEXING')
            for chunk in chunks:
                try:
                    embedding = generate_text_embedding(chunk.get('content', ''))
                    chunk['embedding'] = embedding
                except Exception:
                    chunk['embedding'] = []

            try:
                save_chunks(doc_id, chunks)
            except Exception as e:
                logger.warning(f"Chunk save failed (non-critical): {e}")

        # 5. COMPLETED
        update_document_status(doc_id, status='COMPLETED', analysis=json.dumps(result))
        logger.info(f"Document {doc_id} processed successfully.")

    except Exception as e:
        logger.error(f"Failed to process document {doc_id}: {e}")
        update_document_status(doc_id, status='FAILED')
    finally:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                logger.warning(f"Could not remove temp file {filepath}: {e}")


def trigger_document_pipeline(user_id: str, filepath: str, filename: str,
                              file_type: str, file_size: int, doc_hash: str,
                              title: str, scope: str, ai_engine: str) -> str:
    """
    Validates cache. If not cached, stores metadata and queues processing.
    Returns the document ID.
    """
    doc_id, is_cached = create_document(
        user_id=user_id,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        document_hash=doc_hash,
        status='COMPLETED' if is_cached else 'UPLOADED'
    )

    if is_cached:
        logger.info(f"Document {doc_hash} cached (ID: {doc_id}). Skipping processing.")
        if os.path.exists(filepath):
            os.remove(filepath)
        return doc_id

    if is_vercel():
        # Vercel: process synchronously within the request
        logger.info("Vercel detected — processing document synchronously.")
        _process_document_background(doc_id, filepath, title, scope, ai_engine)
    else:
        # Local: process asynchronously
        logger.info("Queuing document pipeline asynchronously.")
        executor.submit(_process_document_background, doc_id, filepath, title, scope, ai_engine)

    return doc_id
