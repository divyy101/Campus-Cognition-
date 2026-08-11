"""
Document Repository — MongoDB CRUD for document uploads, chunks, and analysis caching.
"""

import hashlib
import logging
from datetime import datetime, timezone
from bson import ObjectId

from database.mongodb import get_db

logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc)


def _doc_row(row):
    if row is None:
        return None
    doc = dict(row)
    doc['id'] = str(doc.pop('_id'))
    return doc


# ---------------------------------------------------------------------------
# Document metadata
# ---------------------------------------------------------------------------

def hash_file_bytes(file_bytes):
    """Calculate SHA-256 hash of file contents."""
    return hashlib.sha256(file_bytes).hexdigest()


def create_document(user_id, filename, file_type, file_size, document_hash,
                    status='UPLOADED', metadata=None):
    """Create a document metadata record. Returns the document id."""
    db = get_db()

    # Check for duplicate by hash
    existing = db.documents.find_one({'document_hash': document_hash})
    if existing:
        return str(existing['_id']), True  # (id, is_cached)

    result = db.documents.insert_one({
        'user_id': user_id,
        'filename': filename,
        'file_type': file_type,
        'file_size': file_size,
        'document_hash': document_hash,
        'status': status,
        'metadata': metadata or {},
        'analysis': None,
        'created_at': _now(),
        'updated_at': _now(),
    })
    return str(result.inserted_id), False


def update_document_status(doc_id, status, analysis=None):
    """Update processing status and optionally attach analysis."""
    db = get_db()
    update = {'status': status, 'updated_at': _now()}
    if analysis is not None:
        update['analysis'] = analysis
    db.documents.update_one({'_id': ObjectId(doc_id)}, {'$set': update})


def get_document(doc_id, user_id=None):
    """Get a document by id."""
    db = get_db()
    query = {'_id': ObjectId(doc_id)}
    if user_id:
        query['user_id'] = user_id
    return _doc_row(db.documents.find_one(query))


def get_document_by_hash(document_hash):
    """Get a document by its SHA-256 hash (cache hit)."""
    db = get_db()
    return _doc_row(db.documents.find_one({'document_hash': document_hash}))


def get_user_documents(user_id, limit=20):
    """Get all documents for a user."""
    db = get_db()
    cursor = db.documents.find({'user_id': user_id}).sort('created_at', -1).limit(limit)
    return [_doc_row(doc) for doc in cursor]


# ---------------------------------------------------------------------------
# Document chunks (for semantic chunking)
# ---------------------------------------------------------------------------

def save_chunks(document_id, chunks):
    """Save semantic document chunks.
    
    chunks: list of {chunk_index, unit, topic, page_start, page_end, content, metadata}
    """
    db = get_db()
    for chunk in chunks:
        chunk['document_id'] = document_id
        chunk['created_at'] = _now()
    if chunks:
        db.document_chunks.insert_many(chunks)


def get_chunks(document_id):
    """Get all chunks for a document, ordered by index."""
    db = get_db()
    cursor = db.document_chunks.find(
        {'document_id': document_id}
    ).sort('chunk_index', 1)
    return [_doc_row(doc) for doc in cursor]


def semantic_search_chunks(user_id, query_embedding, limit=5):
    """
    Perform a MongoDB Vector Search on document chunks using the query embedding.
    Assumes an Atlas Vector Search index named 'default' exists on the 'embedding' field.
    """
    db = get_db()
    
    # We must filter by user_id to ensure students only search their own documents
    # First, get the user's document IDs
    user_docs = list(db.documents.find({'user_id': user_id}, {'_id': 1}))
    user_doc_ids = [str(doc['_id']) for doc in user_docs]
    
    if not user_doc_ids:
        return []
        
    pipeline = [
        {
            "$vectorSearch": {
                "index": "default",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 50,
                "limit": limit
            }
        },
        {
            "$match": {
                "document_id": {"$in": user_doc_ids}
            }
        },
        {
            "$project": {
                "embedding": 0,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    try:
        results = list(db.document_chunks.aggregate(pipeline))
        return [_doc_row(doc) for doc in results]
    except Exception as e:
        logger.error(f"Vector search failed (Index might not be created yet): {e}")
        return []


def search_chunks(document_id, query, limit=5):
    """Simple text search across chunks of a document."""
    db = get_db()
    cursor = db.document_chunks.find({
        'document_id': document_id,
        'content': {'$regex': query, '$options': 'i'}
    }).limit(limit)
    return [_doc_row(doc) for doc in cursor]
