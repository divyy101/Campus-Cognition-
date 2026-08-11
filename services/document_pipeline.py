"""
Campus Cognition V2 — Document Pipeline Service
Handles asynchronous processing of uploaded documents.
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

# In local development, we use ThreadPoolExecutor.
# In production (Vercel), background threads are paused when the request ends.
# Therefore, on Vercel, we must either process synchronously (if limits allow)
# or offload to a serverless queue (like Upstash QStash, AWS SQS, or Vercel Cron).
# For now, we will execute synchronously if running on Vercel, or asynchronously locally.
executor = ThreadPoolExecutor(max_workers=4)

def is_vercel() -> bool:
    """Check if running in Vercel serverless environment."""
    return os.environ.get('VERCEL') == '1'

def _process_document_background(doc_id: str, filepath: str, title: str, scope: str, ai_engine: str):
    """Background task to extract text, run AI analysis, and chunk/index."""
    try:
        # 1. EXTRACTING
        update_document_status(doc_id, status='EXTRACTING')
        _, extracted_text = process_document(filepath)
        
        # 2. ANALYZING
        update_document_status(doc_id, status='ANALYZING')
        
        # We simulate passing just this document as syllabus, with no PQPs for simplicity in the pipeline.
        result = analyze_study_materials(
            syllabus_text=extracted_text,
            pyq_text="",
            subject_name=title,
            scope=scope,
            ai_engine=ai_engine
        )
        
        if not result.get('success'):
            raise Exception("AI analysis failed.")
            
        # Extract and save advanced insights (Phases 14, 15)
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
        
        save_topic_frequency(doc_id, session_id, study_priority)
        save_study_roadmap(doc_id, session_id, weekly_plan)
            
        # 3. CHUNKING (Phase 8)
        update_document_status(doc_id, status='CHUNKING')
        chunks = chunk_document(doc_id, extracted_text)
        
        # 4. INDEXING (Phase 9-10)
        update_document_status(doc_id, status='INDEXING')
        for chunk in chunks:
            # Generate embedding for each chunk
            embedding = generate_text_embedding(chunk['content'])
            chunk['embedding'] = embedding
            
        # Save chunks to MongoDB
        if chunks:
            save_chunks(doc_id, chunks)
        
        # 5. COMPLETED
        update_document_status(doc_id, status='COMPLETED', analysis=json.dumps(result))
        logger.info(f"Document {doc_id} processed successfully.")
        
    except Exception as e:
        logger.error(f"Failed to process document {doc_id}: {e}")
        update_document_status(doc_id, status='FAILED')
    finally:
        # Cleanup temporary file if needed
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                logger.warning(f"Could not remove temp file {filepath}: {e}")

def trigger_document_pipeline(user_id: str, filepath: str, filename: str, file_type: str, file_size: int, doc_hash: str, title: str, scope: str, ai_engine: str) -> str:
    """
    Validates cache. If not cached, stores metadata and queues background processing.
    Returns the document ID.
    """
    # Create or get existing document
    doc_id, is_cached = create_document(
        user_id=user_id,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        document_hash=doc_hash,
        status='COMPLETED' if is_cached else 'UPLOADED'
    )
    
    if is_cached:
        logger.info(f"Document {doc_hash} already exists in cache (ID: {doc_id}). Skipping processing.")
        # Cleanup uploaded file since we don't need it
        if os.path.exists(filepath):
            os.remove(filepath)
        return doc_id
        
    if is_vercel():
        # Execute synchronously on Vercel to guarantee completion before serverless function exits.
        # Note: Large files may hit the 10-60s execution limit on Vercel Hobby/Pro.
        # In a full enterprise setup, replace this with a queuing service like QStash.
        logger.info("Vercel environment detected. Executing document pipeline synchronously.")
        _process_document_background(doc_id, filepath, title, scope, ai_engine)
    else:
        # Execute asynchronously in background thread for local/VPS deployment.
        logger.info("Local environment detected. Queuing document pipeline asynchronously.")
        executor.submit(_process_document_background, doc_id, filepath, title, scope, ai_engine)
        
    return doc_id
