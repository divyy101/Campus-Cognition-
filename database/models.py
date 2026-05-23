import sqlite3
import os
from datetime import datetime
import hashlib
from werkzeug.security import generate_password_hash, check_password_hash

# Database file path
ORIGINAL_DB_PATH = os.path.join(os.path.dirname(__file__), 'campus_cognition.db')

if os.environ.get('VERCEL'):
    DB_PATH = '/tmp/campus_cognition.db'
    # Copy pre-populated original SQLite database to /tmp on startup if not present
    if not os.path.exists(DB_PATH) and os.path.exists(ORIGINAL_DB_PATH):
        import shutil
        try:
            shutil.copy2(ORIGINAL_DB_PATH, DB_PATH)
            os.chmod(DB_PATH, 0o666)
        except Exception as e:
            print(f"Error copying database to /tmp: {e}")
else:
    DB_PATH = ORIGINAL_DB_PATH

def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with all tables"""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Users table
    c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        branch TEXT,
        cgpa REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Study Sessions table
    c.execute('''
    CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        syllabus_path TEXT,
        pqp_path TEXT,
        important_topics TEXT,
        study_priority TEXT,
        weekly_plan TEXT,
        charts_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Opportunities table
    c.execute('''
    CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT,
        description TEXT,
        required_skills TEXT,
        required_branch TEXT,
        min_cgpa REAL,
        deadline TEXT,
        link TEXT,
        type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # User Opportunities (matched)
    c.execute('''
    CREATE TABLE IF NOT EXISTS user_opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        opportunity_id INTEGER NOT NULL,
        match_percentage REAL,
        applied BOOLEAN DEFAULT 0,
        applied_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id),
        UNIQUE(user_id, opportunity_id)
    )
    ''')
    
    # Code Analysis History
    c.execute('''
    CREATE TABLE IF NOT EXISTS code_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        language TEXT,
        explanation TEXT,
        errors TEXT,
        suggestions TEXT,
        optimized_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    # Activity Log
    c.execute('''
    CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password securely using Werkzeug's generate_password_hash"""
    return generate_password_hash(password)

def verify_password(password, hashed, user_id=None):
    """Verify password against hash. Supports salted PBKDF2/scrypt and old SHA-256 with auto-migration."""
    if not hashed:
        return False
        
    # Check if this is a secure Werkzeug hash
    if hashed.startswith(('pbkdf2:sha256:', 'scrypt:', 'bcrypt:', 'pbkdf2:')):
        try:
            return check_password_hash(hashed, password)
        except Exception:
            pass

    # Fallback/migration for legacy SHA-256 unsalted hash
    legacy_hash = hashlib.sha256(password.encode()).hexdigest()
    if legacy_hash == hashed:
        # If user_id is provided, automatically upgrade legacy hash to secure hash
        if user_id:
            try:
                conn = get_db_connection()
                c = conn.cursor()
                secure_hash = hash_password(password)
                c.execute('UPDATE users SET password = ? WHERE id = ?', (secure_hash, user_id))
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"Error upgrading legacy password hash: {e}")
        return True
        
    return False

# User functions
def create_user(username, email, password, first_name='', last_name=''):
    """Create a new user"""
    try:
        conn = get_db_connection()
        c = conn.cursor()
        hashed_password = hash_password(password)
        c.execute('''
        INSERT INTO users (username, email, password, first_name, last_name)
        VALUES (?, ?, ?, ?, ?)
        ''', (username, email, hashed_password, first_name, last_name))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        return None

def get_user_by_username(username):
    """Get user by username"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    """Get user by ID"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    conn.close()
    return user

def update_user_profile(user_id, branch, cgpa):
    """Update user profile"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    UPDATE users SET branch = ?, cgpa = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    ''', (branch, cgpa, user_id))
    conn.commit()
    conn.close()

# Study Session functions
def create_study_session(user_id, title, syllabus_path=None, pqp_path=None):
    """Create a new study session"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    INSERT INTO study_sessions (user_id, title, syllabus_path, pqp_path)
    VALUES (?, ?, ?, ?)
    ''', (user_id, title, syllabus_path, pqp_path))
    conn.commit()
    session_id = c.lastrowid
    conn.close()
    return session_id

def save_study_analysis(session_id, important_topics, study_priority, weekly_plan, charts_data):
    """Save study analysis results"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    UPDATE study_sessions 
    SET important_topics = ?, study_priority = ?, weekly_plan = ?, charts_data = ?
    WHERE id = ?
    ''', (important_topics, study_priority, weekly_plan, charts_data, session_id))
    conn.commit()
    conn.close()

def get_user_study_sessions(user_id):
    """Get all study sessions for a user"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    SELECT * FROM study_sessions WHERE user_id = ? ORDER BY created_at DESC
    ''', (user_id,))
    sessions = c.fetchall()
    conn.close()
    return sessions

# Opportunity functions
def create_opportunity(title, company, description, required_skills, required_branch, min_cgpa, deadline, link, op_type):
    """Create a new opportunity"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    INSERT INTO opportunities (title, company, description, required_skills, required_branch, min_cgpa, deadline, link, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (title, company, description, required_skills, required_branch, min_cgpa, deadline, link, op_type))
    conn.commit()
    opp_id = c.lastrowid
    conn.close()
    return opp_id

def get_all_opportunities():
    """Get all opportunities"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM opportunities ORDER BY deadline ASC')
    opportunities = c.fetchall()
    conn.close()
    return opportunities

def match_opportunities(user_id, skills_list):
    """Match opportunities based on user profile"""
    user = get_user_by_id(user_id)
    if not user:
        return []
    
    all_opps = get_all_opportunities()
    matched = []
    
    for opp in all_opps:
        match_percentage = 0
        
        # Check CGPA match
        if user['cgpa'] and opp['min_cgpa']:
            if user['cgpa'] >= opp['min_cgpa']:
                match_percentage += 30
        
        # Check branch match
        if user['branch'] and opp['required_branch']:
            if user['branch'].lower() in opp['required_branch'].lower():
                match_percentage += 30
        
        # Check skills match
        if opp['required_skills']:
            opp_skills = [s.strip().lower() for s in opp['required_skills'].split(',')]
            user_skills = [s.strip().lower() for s in skills_list]
            matched_skills = len(set(opp_skills) & set(user_skills))
            if matched_skills > 0:
                match_percentage += min(40, (matched_skills / len(opp_skills)) * 40)
        
        if match_percentage > 0:
            matched.append({
                'opportunity': opp,
                'match_percentage': round(match_percentage, 2)
            })
    
    return sorted(matched, key=lambda x: x['match_percentage'], reverse=True)

def save_user_opportunity(user_id, opportunity_id, match_percentage):
    """Save matched opportunity for user"""
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('''
        INSERT INTO user_opportunities (user_id, opportunity_id, match_percentage)
        VALUES (?, ?, ?)
        ''', (user_id, opportunity_id, match_percentage))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    conn.close()

def get_user_opportunities(user_id):
    """Get user's matched opportunities"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    SELECT uo.*, o.* FROM user_opportunities uo
    JOIN opportunities o ON uo.opportunity_id = o.id
    WHERE uo.user_id = ?
    ORDER BY uo.match_percentage DESC
    ''', (user_id,))
    opportunities = c.fetchall()
    conn.close()
    return opportunities

# Code Analysis functions
def save_code_analysis(user_id, code, language, explanation, errors, suggestions, optimized_code):
    """Save code analysis"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    INSERT INTO code_analysis (user_id, code, language, explanation, errors, suggestions, optimized_code)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, code, language, explanation, errors, suggestions, optimized_code))
    conn.commit()
    analysis_id = c.lastrowid
    conn.close()
    return analysis_id

def get_code_analysis_history(user_id, limit=10):
    """Get user's code analysis history"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    SELECT * FROM code_analysis WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
    ''', (user_id, limit))
    history = c.fetchall()
    conn.close()
    return history

# Activity logging
def log_activity(user_id, action, description=''):
    """Log user activity"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    INSERT INTO activity_log (user_id, action, description)
    VALUES (?, ?, ?)
    ''', (user_id, action, description))
    conn.commit()
    conn.close()

def get_user_activity(user_id, limit=20):
    """Get user's activity log"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
    SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
    ''', (user_id, limit))
    activities = c.fetchall()
    conn.close()
    return activities

# Insert sample opportunities
def insert_sample_opportunities():
    """Insert sample opportunities data"""
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) as count FROM opportunities')
    if c.fetchone()['count'] > 0:
        conn.close()
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
    
    for opp in sample_opps:
        c.execute('''
        INSERT INTO opportunities (title, company, description, required_skills, required_branch, min_cgpa, deadline, link, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', opp)
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    insert_sample_opportunities()
    print("Database initialized successfully!")
