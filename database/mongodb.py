"""
Campus Cognition V2 — MongoDB Atlas Connection Manager
Single source of truth for all database operations.
"""

import os
import logging
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger(__name__)

_client = None
_db = None


def get_client():
    """Get or create the MongoDB client singleton."""
    global _client
    if _client is None:
        uri = os.getenv('MONGODB_URI', '')
        if not uri:
            raise RuntimeError('MONGODB_URI environment variable is not set')
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=20,
            minPoolSize=1,
            retryWrites=True,
        )
    return _client


def get_db():
    """Get the application database instance."""
    global _db
    if _db is None:
        client = get_client()
        db_name = os.getenv('MONGODB_DB_NAME', 'campus_cognition')
        _db = client[db_name]
    return _db


def health_check():
    """Verify the MongoDB connection is alive."""
    try:
        client = get_client()
        client.admin.command('ping')
        return {'status': 'connected', 'database': get_db().name}
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        logger.error('MongoDB health check failed: %s', exc)
        return {'status': 'disconnected', 'error': str(exc)}


def init_indexes():
    """Create indexes for all collections. Safe to call multiple times."""
    db = get_db()

    # Users
    db.users.create_index('email', unique=True)
    db.users.create_index('username', unique=True)

    # Documents & chunks
    db.documents.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])
    db.documents.create_index('document_hash', unique=True, sparse=True)
    db.document_chunks.create_index([('document_id', ASCENDING), ('chunk_index', ASCENDING)])

    # Study sessions
    db.study_sessions.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])

    # Code reviews
    db.code_reviews.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])

    # Opportunities
    db.opportunities.create_index('type')
    db.opportunities.create_index('deadline')
    db.opportunities.create_index('fingerprint', unique=True, sparse=True)
    db.opportunities.create_index([('skills', ASCENDING)])

    # User opportunities
    db.user_opportunities.create_index([('user_id', ASCENDING), ('opportunity_id', ASCENDING)], unique=True)

    # Applications
    db.applications.create_index([('user_id', ASCENDING), ('status', ASCENDING)])

    # Search history
    db.search_history.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])

    # Search cache
    db.search_cache.create_index('cache_key', unique=True)
    db.search_cache.create_index('expires_at')

    # Activity logs
    db.activity_logs.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])

    # AI conversations
    db.ai_conversations.create_index([('user_id', ASCENDING), ('created_at', DESCENDING)])

    # Notifications
    db.notifications.create_index([('user_id', ASCENDING), ('read', ASCENDING), ('created_at', DESCENDING)])

    # Password reset tokens
    db.password_reset_tokens.create_index('token_hash', unique=True)
    db.password_reset_tokens.create_index('expires_at')

    logger.info('MongoDB indexes initialized')


def close_connection():
    """Close the MongoDB connection cleanly."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
