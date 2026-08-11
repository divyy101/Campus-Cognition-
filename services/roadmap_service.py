"""
Campus Cognition V2 — Roadmap Service
Handles adaptive learning paths, mastery calculation, and next best action logic.
"""
import logging
from typing import Dict, Optional

from database.repositories.study_repository import (
    get_study_roadmap, save_study_roadmap, get_topic_frequency, get_user_study_sessions
)
from database.mongodb import get_db

logger = logging.getLogger(__name__)

def update_topic_mastery(user_id: str, session_id: str, topic: str, mastery_score: int):
    """
    Update mastery score for a specific topic in a session.
    mastery_score is 0-100.
    """
    db = get_db()
    # Ensure user has a mastery record for this topic
    db.topic_mastery.update_one(
        {'user_id': user_id, 'session_id': session_id, 'topic': topic},
        {'$set': {'mastery': mastery_score}},
        upsert=True
    )

def get_next_best_action(user_id: str) -> Optional[Dict]:
    """
    Calculate the next best study action for the user across all their sessions.
    Prioritizes low mastery + high PYQ frequency.
    """
    # 1. Get recent sessions
    sessions = get_user_study_sessions(user_id, limit=3)
    if not sessions:
        return None
        
    db = get_db()
    candidates = []
    
    # 2. Collect topics and frequencies from recent sessions
    for session in sessions:
        session_id = str(session['id'])
        
        freq_data = get_topic_frequency(user_id, session_id)
        if not freq_data or 'topics' not in freq_data:
            continue
            
        topics = freq_data['topics']
        
        # 3. For each topic, calculate priority score
        for t in topics:
            topic_name = t.get('topic')
            frequency = t.get('frequency', 1)
            
            # Fetch mastery
            mastery_record = db.topic_mastery.find_one({'user_id': user_id, 'session_id': session_id, 'topic': topic_name})
            mastery = mastery_record['mastery'] if mastery_record else 0
            
            # If mastery is > 80%, skip it
            if mastery > 80:
                continue
                
            # Priority Score: Frequency (higher is better) combined with Mastery (lower is better)
            # Max frequency is usually ~5. Let's normalize it to 100.
            freq_score = min(100, frequency * 20)
            priority_score = freq_score - (mastery * 0.5)
            
            candidates.append({
                'topic': topic_name,
                'session_title': session.get('title', 'Study Session'),
                'mastery': mastery,
                'frequency': frequency,
                'priority_score': priority_score,
                'recommended_duration': 45 if mastery > 40 else 60
            })
            
    if not candidates:
        return None
        
    # Sort candidates by priority score descending
    candidates.sort(key=lambda x: x['priority_score'], reverse=True)
    return candidates[0]
