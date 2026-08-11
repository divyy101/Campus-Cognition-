"""
Activity Repository — MongoDB CRUD for activity logs, search history, AI conversations.
"""

import logging
from datetime import datetime, timezone
from bson import ObjectId

from database.mongodb import get_db

logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc)


def _activity_doc(row):
    if row is None:
        return None
    doc = dict(row)
    doc['id'] = str(doc.pop('_id'))
    return doc


# ---------------------------------------------------------------------------
# Activity Log
# ---------------------------------------------------------------------------

def log_activity(user_id, action, description=''):
    """Log a user activity."""
    db = get_db()
    db.activity_logs.insert_one({
        'user_id': user_id,
        'action': action,
        'description': description,
        'created_at': _now(),
    })


def get_user_activity(user_id, limit=20):
    """Get user's activity log, newest first."""
    db = get_db()
    cursor = db.activity_logs.find(
        {'user_id': user_id}
    ).sort('created_at', -1).limit(limit)
    return [_activity_doc(doc) for doc in cursor]


# ---------------------------------------------------------------------------
# Search History
# ---------------------------------------------------------------------------

def save_search_history(user_id, query, filters=None, result_count=0, search_type='general'):
    """Record a search in history."""
    db = get_db()
    db.search_history.insert_one({
        'user_id': user_id,
        'query': query,
        'filters': filters or {},
        'result_count': result_count,
        'search_type': search_type,
        'created_at': _now(),
    })


def get_search_history(user_id, limit=10):
    """Get user's recent search history."""
    db = get_db()
    cursor = db.search_history.find(
        {'user_id': user_id}
    ).sort('created_at', -1).limit(limit)
    return [_activity_doc(doc) for doc in cursor]


# ---------------------------------------------------------------------------
# AI Conversations (Memory)
# ---------------------------------------------------------------------------

def save_ai_conversation(user_id, agent_type, messages, metadata=None):
    """Save an AI conversation turn."""
    db = get_db()
    result = db.ai_conversations.insert_one({
        'user_id': user_id,
        'agent_type': agent_type,  # study, code, career, copilot
        'messages': messages,
        'metadata': metadata or {},
        'created_at': _now(),
    })
    return str(result.inserted_id)


def get_recent_conversations(user_id, agent_type=None, limit=5):
    """Get recent AI conversations for context."""
    db = get_db()
    query = {'user_id': user_id}
    if agent_type:
        query['agent_type'] = agent_type
    cursor = db.ai_conversations.find(query).sort('created_at', -1).limit(limit)
    return [_activity_doc(doc) for doc in cursor]


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

def create_notification(user_id, title, message, notification_type='info', link=None):
    """Create a notification for the user."""
    db = get_db()
    db.notifications.insert_one({
        'user_id': user_id,
        'title': title,
        'message': message,
        'type': notification_type,
        'link': link,
        'read': False,
        'created_at': _now(),
    })


def get_notifications(user_id, unread_only=False, limit=20):
    """Get user's notifications."""
    db = get_db()
    query = {'user_id': user_id}
    if unread_only:
        query['read'] = False
    cursor = db.notifications.find(query).sort('created_at', -1).limit(limit)
    return [_activity_doc(doc) for doc in cursor]


def mark_notification_read(notification_id, user_id):
    """Mark a notification as read."""
    db = get_db()
    db.notifications.update_one(
        {'_id': ObjectId(notification_id), 'user_id': user_id},
        {'$set': {'read': True}}
    )


# ---------------------------------------------------------------------------
# Application Tracking
# ---------------------------------------------------------------------------

VALID_STATUSES = ['DISCOVERED', 'SAVED', 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']


def update_application_status(user_id, opportunity_id, status):
    """Update the application status for an opportunity."""
    if status not in VALID_STATUSES:
        raise ValueError(f'Invalid status: {status}. Must be one of {VALID_STATUSES}')
    db = get_db()
    db.user_opportunities.update_one(
        {'user_id': user_id, 'opportunity_id': opportunity_id},
        {'$set': {'status': status, 'updated_at': _now()}}
    )


def get_applications(user_id, status=None, limit=50):
    """Get user's application tracker."""
    db = get_db()
    query = {'user_id': user_id}
    if status:
        query['status'] = status
    cursor = db.user_opportunities.find(query).sort('updated_at', -1).limit(limit)
    return [_activity_doc(doc) for doc in cursor]
