"""
User Repository — MongoDB CRUD for user accounts.
"""

from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
import hashlib
import logging

from database.mongodb import get_db

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(password):
    """Hash password securely using Werkzeug's PBKDF2/scrypt."""
    return generate_password_hash(password)


def verify_password(password, hashed, user_id=None):
    """Verify password against hash. Supports legacy SHA-256 with auto-migration."""
    if not hashed:
        return False

    # Modern Werkzeug hash
    if ':' in hashed:
        try:
            return check_password_hash(hashed, password)
        except Exception:
            pass

    # Legacy SHA-256 fallback with auto-upgrade
    legacy_hash = hashlib.sha256(password.encode()).hexdigest()
    if legacy_hash == hashed:
        if user_id:
            try:
                db = get_db()
                secure_hash = hash_password(password)
                db.users.update_one(
                    {'_id': user_id},
                    {'$set': {'password': secure_hash, 'updated_at': _now()}}
                )
                logger.info('Upgraded legacy password hash for user %s', user_id)
            except Exception as e:
                logger.error('Error upgrading legacy password hash: %s', e)
        return True

    return False


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now():
    return datetime.now(timezone.utc)


def _user_doc(row):
    """Normalise a MongoDB user document so existing templates keep working."""
    if row is None:
        return None
    doc = dict(row)
    doc['id'] = doc.pop('_id')  # templates use user['id']
    return doc


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

def create_user(username, email, password, first_name='', last_name=''):
    """Create a new user. Returns the user _id or None on duplicate."""
    db = get_db()
    try:
        result = db.users.insert_one({
            'username': username,
            'email': email.lower().strip(),
            'password': hash_password(password),
            'first_name': first_name,
            'last_name': last_name,
            'branch': None,
            'cgpa': None,
            'skills': [],
            'interests': [],
            'profile_complete': False,
            'created_at': _now(),
            'updated_at': _now(),
        })
        return result.inserted_id
    except Exception as e:
        logger.error('create_user failed: %s', e)
        return None


def get_user_by_username(username):
    """Case-insensitive username lookup."""
    if not username:
        return None
    db = get_db()
    import re
    user = db.users.find_one({'username': re.compile(f'^{re.escape(username)}$', re.IGNORECASE)})
    return _user_doc(user)


def get_user_by_email(email):
    """Case-insensitive email lookup."""
    if not email:
        return None
    db = get_db()
    user = db.users.find_one({'email': email.lower().strip()})
    return _user_doc(user)


def get_user_by_id(user_id):
    """Get user by _id."""
    db = get_db()
    user = db.users.find_one({'_id': user_id})
    return _user_doc(user)


def update_user_profile(user_id, branch=None, cgpa=None, **extra_fields):
    """Update profile fields."""
    db = get_db()
    update = {'updated_at': _now()}
    if branch is not None:
        update['branch'] = branch
    if cgpa is not None:
        update['cgpa'] = cgpa
    update.update(extra_fields)
    db.users.update_one({'_id': user_id}, {'$set': update})


def update_password(user_id, password_hash):
    """Set a new password hash."""
    db = get_db()
    db.users.update_one(
        {'_id': user_id},
        {'$set': {'password': password_hash, 'updated_at': _now()}}
    )


def delete_user(user_id):
    """Delete a user and cascading data."""
    db = get_db()
    try:
        db.study_sessions.delete_many({'user_id': user_id})
        db.code_reviews.delete_many({'user_id': user_id})
        db.user_opportunities.delete_many({'user_id': user_id})
        db.activity_logs.delete_many({'user_id': user_id})
        db.search_history.delete_many({'user_id': user_id})
        db.ai_conversations.delete_many({'user_id': user_id})
        db.notifications.delete_many({'user_id': user_id})
        db.applications.delete_many({'user_id': user_id})
        db.documents.delete_many({'user_id': user_id})
        db.document_chunks.delete_many({'user_id': user_id})
        db.password_reset_tokens.delete_many({'user_id': user_id})
        db.users.delete_one({'_id': user_id})
        return True
    except Exception as e:
        logger.error('update_user_profile failed: %s', e)
        return False


# ---------------------------------------------------------------------------
# Student Intelligence (Phase 22)
# ---------------------------------------------------------------------------

def calculate_student_intelligence(user_id):
    """
    Calculate Academic, Coding, Career, and Overall scores based on real usage.
    """
    db = get_db()
    
    # Academic Score
    study_sessions = list(db.study_sessions.find({'user_id': user_id}))
    mastery_records = list(db.topic_mastery.find({'user_id': user_id}))
    
    academic_score = 0
    if study_sessions:
        base_academic = min(50, len(study_sessions) * 10) # Max 50 for sessions
        avg_mastery = sum(m.get('mastery', 0) for m in mastery_records) / len(mastery_records) if mastery_records else 0
        academic_score = base_academic + (avg_mastery * 0.5)
        academic_score = min(100, int(academic_score))
        
    # Coding Score
    # Check activity logs for coding activity
    coding_logs = list(db.activity_logs.find({'user_id': user_id, 'action': 'CODE_REVIEW'}))
    coding_score = min(100, len(coding_logs) * 15)
    
    # Career Score
    career_logs = list(db.activity_logs.find({'user_id': user_id, 'action': {'$regex': '^CAREER'}}))
    saved_opps = list(db.user_opportunities.find({'user_id': user_id}))
    career_score = min(100, (len(career_logs) * 10) + (len(saved_opps) * 5))
    
    user = db.users.find_one({'_id': user_id})
    if user and user.get('profile_complete'):
        career_score = min(100, career_score + 20)
        
    # Overall Score
    overall_score = int((academic_score * 0.4) + (coding_score * 0.3) + (career_score * 0.3))
    
    return {
        'academic_score': academic_score,
        'coding_score': coding_score,
        'career_score': career_score,
        'overall_score': overall_score,
        'metrics': {
            'study_sessions_count': len(study_sessions),
            'coding_reviews_count': len(coding_logs),
            'saved_opportunities': len(saved_opps)
        }
    }


# ---------------------------------------------------------------------------
# Password reset tokens
# ---------------------------------------------------------------------------

def create_password_reset_token(user_id, token_hash, expires_at):
    """Invalidate old tokens and insert one new hashed reset token."""
    db = get_db()
    db.password_reset_tokens.delete_many({'user_id': user_id})
    db.password_reset_tokens.insert_one({
        'user_id': user_id,
        'token_hash': token_hash,
        'expires_at': expires_at,
        'used_at': None,
        'created_at': _now(),
    })


def consume_password_reset_token(token_hash):
    """Return the owner user_id of a valid one-time token and mark it used."""
    db = get_db()
    doc = db.password_reset_tokens.find_one_and_update(
        {
            'token_hash': token_hash,
            'used_at': None,
            'expires_at': {'$gt': _now()},
        },
        {'$set': {'used_at': _now()}},
    )
    return doc['user_id'] if doc else None
