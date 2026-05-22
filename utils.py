"""
Campus Cognition - Utility Functions
Helper functions for common operations
"""

import os
import json
from datetime import datetime, timedelta
from PyPDF2 import PdfReader
from collections import Counter

def is_allowed_file(filename, allowed_extensions={'pdf', 'txt'}):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            pages_text = []
            char_count = 0
            for page in pdf_reader.pages:
                page_text = page.extract_text() or ''
                pages_text.append(page_text)
                char_count += len(page_text)
                if char_count >= 5000:
                    break
            text = '\n'.join(pages_text)
        
        return text, num_pages
    except Exception as e:
        return f"Error extracting text: {str(e)}", 0

def extract_keywords(text, max_keywords=20, min_length=4):
    """Extract keywords from text"""
    # Simple keyword extraction
    words = text.lower().split()
    words = [
        word.strip('.,;:!?()[]{}"\'-')
        for word in words
        if len(word.strip('.,;:!?()[]{}"\'-')) > min_length
    ]
    
    # Count frequencies
    freq = Counter(words)
    
    # Remove common words
    common_words = {
        'the', 'and', 'that', 'have', 'with', 'from', 'this', 'will',
        'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was',
        'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how',
        'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
        'did', 'its', 'let', 'may', 'own', 'say', 'she', 'too', 'use'
    }
    
    for word in common_words:
        freq.pop(word, None)
    
    return dict(freq.most_common(max_keywords))

def calculate_priority_score(frequency, difficulty=1.0, weightage=1.0):
    """Calculate priority score for a topic"""
    return frequency * difficulty * weightage

def generate_weekly_plan(topics, hours_per_day=4):
    """Generate a weekly study plan"""
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    plan = []
    
    topics_per_day = max(1, len(topics) // 7)
    
    for day_idx, day in enumerate(days):
        start_idx = day_idx * topics_per_day
        end_idx = start_idx + topics_per_day if day_idx < 6 else len(topics)
        
        day_topics = topics[start_idx:end_idx]
        
        plan.append({
            'day': day,
            'topics': day_topics,
            'hours': len(day_topics) * (hours_per_day / topics_per_day) if day_topics else 0
        })
    
    return plan

def format_deadline(date_string):
    """Format deadline date"""
    try:
        date = datetime.strptime(date_string, '%Y-%m-%d')
        return date.strftime('%B %d, %Y')
    except:
        return date_string

def get_days_until_deadline(deadline_string):
    """Calculate days until deadline"""
    try:
        deadline = datetime.strptime(deadline_string, '%Y-%m-%d')
        today = datetime.now()
        days = (deadline - today).days
        return max(0, days)
    except:
        return -1

def validate_email(email):
    """Basic email validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def truncate_string(string, length=100):
    """Truncate string to specified length"""
    if len(string) > length:
        return string[:length] + '...'
    return string

def save_json(data, file_path):
    """Save data as JSON"""
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving JSON: {str(e)}")
        return False

def load_json(file_path):
    """Load JSON data"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {str(e)}")
        return None

def get_file_size(file_path):
    """Get file size in MB"""
    try:
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        return round(size_mb, 2)
    except:
        return 0

def delete_file(file_path):
    """Delete file safely"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
    return False

def clean_filename(filename):
    """Clean filename for safe storage"""
    import re
    filename = re.sub(r'[^\w\s.-]', '', filename)
    return filename.replace(' ', '_')[:255]

def calculate_match_percentage(user_cgpa, opp_min_cgpa, user_branch, opp_branch, common_skills, total_skills):
    """Calculate opportunity match percentage"""
    score = 0
    
    # CGPA match (30%)
    if user_cgpa and opp_min_cgpa:
        if user_cgpa >= opp_min_cgpa:
            score += 30
        else:
            score += max(0, (user_cgpa / opp_min_cgpa) * 30)
    
    # Branch match (30%)
    if user_branch and opp_branch:
        if user_branch.lower() in opp_branch.lower():
            score += 30
        else:
            score += 15  # Partial credit
    
    # Skills match (40%)
    if total_skills > 0:
        score += (common_skills / total_skills) * 40
    
    return round(min(100, score), 2)

def get_current_semester():
    """Get current semester (approximate)"""
    month = datetime.now().month
    if month in [1, 2, 3, 4, 5]:
        return "Spring"
    elif month in [6, 7, 8]:
        return "Summer"
    else:
        return "Fall"

def format_activity_description(action, data):
    """Format activity description based on action"""
    descriptions = {
        'login': 'User logged in',
        'logout': 'User logged out',
        'signup': 'New user registered',
        'analyze_study': f'Analyzed study materials',
        'find_opportunities': f'Searched for opportunities',
        'analyze_code': f'Analyzed code',
        'update_profile': f'Updated profile',
    }
    return descriptions.get(action, 'User activity')
