"""
Code Repository — MongoDB CRUD for code reviews and analysis history.
"""

import logging
from datetime import datetime, timezone
from bson import ObjectId

from database.mongodb import get_db

logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc)


def _review_doc(row):
    if row is None:
        return None
    doc = dict(row)
    doc['id'] = str(doc.pop('_id'))
    return doc


def save_code_analysis(user_id, code, language, explanation, errors, suggestions, optimized_code):
    """Save a code review analysis."""
    db = get_db()
    result = db.code_reviews.insert_one({
        'user_id': user_id,
        'code': code,
        'language': language,
        'explanation': explanation,
        'errors': errors,
        'suggestions': suggestions,
        'optimized_code': optimized_code,
        'created_at': _now(),
    })
    return str(result.inserted_id)


def get_code_analysis_history(user_id, limit=10):
    """Get user's code analysis history, newest first."""
    db = get_db()
    cursor = db.code_reviews.find(
        {'user_id': user_id}
    ).sort('created_at', -1).limit(limit)
    return [_review_doc(doc) for doc in cursor]


def get_code_analysis(analysis_id, user_id):
    """Get a single code analysis by id and user."""
    db = get_db()
    try:
        doc = db.code_reviews.find_one({'_id': ObjectId(analysis_id), 'user_id': user_id})
        return _review_doc(doc)
    except Exception:
        return None
