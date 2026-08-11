"""
Opportunity Repository — MongoDB CRUD for opportunities, search cache, and user matches.
"""

import hashlib
import logging
from datetime import datetime, timezone, timedelta
from bson import ObjectId

from database.mongodb import get_db

logger = logging.getLogger(__name__)


def _now():
    return datetime.now(timezone.utc)


def _opp_doc(row):
    if row is None:
        return None
    doc = dict(row)
    doc['id'] = str(doc.pop('_id'))
    return doc


def _fingerprint(title, company):
    """Create a stable fingerprint for deduplication."""
    raw = f"{(title or '').strip().lower()}|{(company or '').strip().lower()}"
    return hashlib.md5(raw.encode()).hexdigest()


# ---------------------------------------------------------------------------
# Opportunities CRUD
# ---------------------------------------------------------------------------

def create_opportunity(title, company, description, required_skills='',
                       required_branch='', min_cgpa=0, deadline='',
                       link='', op_type='Internship', source='manual', **extra):
    """Create or return existing opportunity (dedup by fingerprint)."""
    db = get_db()
    fp = _fingerprint(title, company)

    existing = db.opportunities.find_one({'fingerprint': fp})
    if existing:
        return str(existing['_id'])

    doc = {
        'title': title,
        'company': company,
        'description': description,
        'required_skills': required_skills,
        'skills': [s.strip().lower() for s in required_skills.split(',') if s.strip()] if isinstance(required_skills, str) else required_skills,
        'required_branch': required_branch,
        'min_cgpa': min_cgpa,
        'deadline': deadline,
        'link': link,
        'type': op_type,
        'source': source,
        'fingerprint': fp,
        'created_at': _now(),
    }
    doc.update(extra)
    result = db.opportunities.insert_one(doc)
    return str(result.inserted_id)


def get_all_opportunities(limit=100):
    """Get all opportunities ordered by deadline."""
    db = get_db()
    cursor = db.opportunities.find().sort('deadline', 1).limit(limit)
    return [_opp_doc(doc) for doc in cursor]


def get_opportunity(opp_id):
    """Get a single opportunity."""
    db = get_db()
    try:
        return _opp_doc(db.opportunities.find_one({'_id': ObjectId(opp_id)}))
    except Exception:
        return None


def search_opportunities(query=None, op_type=None, branch=None, min_cgpa=None,
                         skills=None, limit=50):
    """Search opportunities with filters."""
    db = get_db()
    match = {}
    if op_type:
        match['type'] = op_type
    if branch:
        match['required_branch'] = {'$regex': branch, '$options': 'i'}
    if min_cgpa is not None:
        match['min_cgpa'] = {'$lte': min_cgpa}
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(',') if s.strip()] if isinstance(skills, str) else skills
        if skill_list:
            match['skills'] = {'$in': skill_list}
    if query:
        match['$or'] = [
            {'title': {'$regex': query, '$options': 'i'}},
            {'company': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}},
        ]

    cursor = db.opportunities.find(match).sort('created_at', -1).limit(limit)
    return [_opp_doc(doc) for doc in cursor]


# ---------------------------------------------------------------------------
# User Opportunities (matched)
# ---------------------------------------------------------------------------

def save_user_opportunity(user_id, opportunity_id, match_percentage):
    """Link a matched opportunity to a user."""
    db = get_db()
    try:
        db.user_opportunities.update_one(
            {'user_id': user_id, 'opportunity_id': opportunity_id},
            {'$set': {
                'match_percentage': match_percentage,
                'updated_at': _now(),
            }, '$setOnInsert': {
                'applied': False,
                'status': 'DISCOVERED',
                'created_at': _now(),
            }},
            upsert=True,
        )
    except Exception as e:
        logger.error('save_user_opportunity failed: %s', e)


def get_user_opportunities(user_id, limit=50):
    """Get user's matched opportunities with full opportunity data."""
    db = get_db()
    pipeline = [
        {'$match': {'user_id': user_id}},
        {'$sort': {'match_percentage': -1}},
        {'$limit': limit},
        {'$addFields': {'opp_oid': {'$toObjectId': '$opportunity_id'}}},
        {'$lookup': {
            'from': 'opportunities',
            'localField': 'opp_oid',
            'foreignField': '_id',
            'as': 'opportunity',
        }},
        {'$unwind': {'path': '$opportunity', 'preserveNullAndEmptyArrays': True}},
    ]
    results = []
    for doc in db.user_opportunities.aggregate(pipeline):
        flat = dict(doc.get('opportunity', {}))
        flat['match_percentage'] = doc.get('match_percentage', 0)
        flat['applied'] = doc.get('applied', False)
        flat['status'] = doc.get('status', 'DISCOVERED')
        flat['id'] = str(flat.pop('_id', doc.get('opportunity_id', '')))
        flat.pop('opp_oid', None)
        results.append(flat)
    return results


# ---------------------------------------------------------------------------
# Search Cache
# ---------------------------------------------------------------------------

def get_cached_search(cache_key):
    """Return cached search results if still valid."""
    db = get_db()
    doc = db.search_cache.find_one({
        'cache_key': cache_key,
        'expires_at': {'$gt': _now()},
    })
    return doc['results'] if doc else None


def set_cached_search(cache_key, results, ttl_minutes=30):
    """Cache search results with a TTL."""
    db = get_db()
    db.search_cache.update_one(
        {'cache_key': cache_key},
        {'$set': {
            'results': results,
            'expires_at': _now() + timedelta(minutes=ttl_minutes),
            'updated_at': _now(),
        }},
        upsert=True,
    )


# ---------------------------------------------------------------------------
# Sample data seeding
# ---------------------------------------------------------------------------

def insert_sample_opportunities():
    """Insert sample opportunities if the collection is empty."""
    db = get_db()
    if db.opportunities.count_documents({}) > 0:
        return

    sample_opps = [
        ('SDE Intern', 'Google', 'Software Development Engineer Internship', 'Python,Java,DSA', 'CSE,IT', 7.5, '2026-06-30', 'https://careers.google.com', 'Internship'),
        ('Data Science Intern', 'Amazon', 'Data Science and Analytics Internship', 'Python,SQL,ML', 'CSE,IT,ECE', 7.0, '2026-07-15', 'https://amazon.jobs', 'Internship'),
        ('Web Dev Intern', 'Microsoft', 'Web Development Internship', 'JavaScript,React,Node.js', 'CSE,IT', 6.5, '2026-08-30', 'https://microsoft.com/careers', 'Internship'),
        ('Full Stack Dev', 'Flipkart', 'Full Stack Developer Internship', 'Python,JavaScript,React', 'CSE,IT', 6.0, '2026-09-15', 'https://flipkart.jobs', 'Internship'),
        ('Cloud Engineer', 'AWS', 'Cloud Engineering Internship', 'AWS,Python,Linux', 'CSE,IT,ECE', 7.5, '2026-10-31', 'https://aws.amazon.com/careers', 'Internship'),
        ('AI/ML Engineer', 'OpenAI', 'AI and Machine Learning Internship', 'Python,ML,TensorFlow', 'CSE,IT', 8.0, '2026-11-30', 'https://openai.com/careers', 'Internship'),
        ('KVPY Scholarship', 'DST-India', 'Kishore Vaigyanik Protsahan Yojana', 'Science,Math', 'CSE,IT,ECE', 6.0, '2026-12-31', 'https://kvpy.org', 'Scholarship'),
        ('GRE Prep Scholarship', 'ETS', 'Graduate Record Examination Preparation', 'English,Quantitative', 'All', 6.5, '2026-12-15', 'https://ets.org', 'Scholarship'),
    ]

    for title, company, desc, skills, branch, cgpa, deadline, link, op_type in sample_opps:
        create_opportunity(title, company, desc, skills, branch, cgpa, deadline, link, op_type, source='seed')

    logger.info('Inserted %d sample opportunities', len(sample_opps))
