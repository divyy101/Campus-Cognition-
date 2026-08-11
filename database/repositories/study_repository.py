"""
Study Repository — MongoDB CRUD for study sessions, roadmaps, PYQ data.
"""

import json
import logging
from datetime import datetime, timezone
from bson import ObjectId

from database.mongodb import get_db

logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc)


def _session_doc(row):
    """Normalise a MongoDB study session document for templates."""
    if row is None:
        return None
    doc = dict(row)
    doc['id'] = str(doc.pop('_id'))
    return doc


# ---------------------------------------------------------------------------
# Study Sessions
# ---------------------------------------------------------------------------

def create_study_session(user_id, title, syllabus_path=None, pqp_path=None):
    """Create a new study session. Returns the session id as a string."""
    db = get_db()
    result = db.study_sessions.insert_one({
        'user_id': user_id,
        'title': title,
        'syllabus_path': syllabus_path,
        'pqp_path': pqp_path,
        'important_topics': None,
        'study_priority': None,
        'weekly_plan': None,
        'charts_data': None,
        'status': 'CREATED',
        'created_at': _now(),
    })
    return str(result.inserted_id)


def save_study_analysis(session_id, important_topics, study_priority, weekly_plan, charts_data):
    """Save AI analysis results for a study session."""
    db = get_db()
    db.study_sessions.update_one(
        {'_id': ObjectId(session_id)},
        {'$set': {
            'important_topics': important_topics,
            'study_priority': study_priority,
            'weekly_plan': weekly_plan,
            'charts_data': charts_data,
            'status': 'COMPLETED',
            'analyzed_at': _now(),
        }}
    )


def get_user_study_sessions(user_id, limit=20):
    """Get all study sessions for a user, newest first."""
    db = get_db()
    cursor = db.study_sessions.find(
        {'user_id': user_id}
    ).sort('created_at', -1).limit(limit)
    return [_session_doc(doc) for doc in cursor]


def get_study_session(session_id, user_id):
    """Get a single study session by id and user."""
    db = get_db()
    try:
        doc = db.study_sessions.find_one({'_id': ObjectId(session_id), 'user_id': user_id})
        return _session_doc(doc)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Study Roadmaps
# ---------------------------------------------------------------------------

def save_study_roadmap(user_id, session_id, roadmap_data):
    """Save a personalized study roadmap."""
    db = get_db()
    db.study_roadmaps.update_one(
        {'user_id': user_id, 'session_id': session_id},
        {'$set': {
            'roadmap': roadmap_data,
            'updated_at': _now(),
        }},
        upsert=True,
    )


def get_study_roadmap(user_id, session_id=None):
    """Get latest roadmap for a user, optionally for a specific session."""
    db = get_db()
    query = {'user_id': user_id}
    if session_id:
        query['session_id'] = session_id
    return db.study_roadmaps.find_one(query, sort=[('updated_at', -1)])


# ---------------------------------------------------------------------------
# Topic Frequency (PYQ Intelligence)
# ---------------------------------------------------------------------------

def save_topic_frequency(user_id, session_id, topics):
    """Save extracted topic frequencies from PYQs.
    
    topics: list of {'topic': str, 'frequency': int, 'unit': str, ...}
    """
    db = get_db()
    db.topic_frequency.update_one(
        {'user_id': user_id, 'session_id': session_id},
        {'$set': {
            'topics': topics,
            'updated_at': _now(),
        }},
        upsert=True,
    )


def get_topic_frequency(user_id, session_id=None):
    """Get topic frequency data."""
    db = get_db()
    query = {'user_id': user_id}
    if session_id:
        query['session_id'] = session_id
    return db.topic_frequency.find_one(query, sort=[('updated_at', -1)])
