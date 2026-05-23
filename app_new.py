import os
import json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_session import Session
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import PyPDF2
from collections import Counter
import google.generativeai as genai
from functools import wraps
from services.gemini_service import analyze_study_materials, analyze_code, is_api_available, get_api_status

# Import database models
from database.models import (
    init_db, get_user_by_username, create_user, verify_password, get_user_by_id,
    create_study_session, save_study_analysis, get_user_study_sessions,
    create_opportunity, match_opportunities, save_user_opportunity, get_user_opportunities,
    save_code_analysis, get_code_analysis_history, log_activity, get_user_activity,
    update_user_profile, get_all_opportunities, insert_sample_opportunities, get_db_connection,
    hash_password, get_user_by_email, delete_user_and_records
)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'campus-cognition-secret-key-2026')

# Vercel Serverless configurations
if os.environ.get('VERCEL'):
    app.config['UPLOAD_FOLDER'] = '/tmp'  # Use writeable /tmp folder
else:
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    Session(app)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize database
with app.app_context():
    init_db()
    insert_sample_opportunities()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = get_user_by_username(username)
        
        if user and verify_password(password, user['password'], user_id=user['id']):
            session['user_id'] = user['id']
            log_activity(user['id'], 'LOGIN', f'User logged in at {datetime.now()}')
            return jsonify({'success': True, 'message': 'Login successful!', 'redirect': url_for('dashboard')})
        
        return jsonify({'success': False, 'message': 'Invalid username or password'})
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        first_name = request.form.get('first_name', '')

        # Check if email is already used to register and wipe previous data to allow fresh replacement
        existing_user_by_email = get_user_by_email(email) if email else None
        if existing_user_by_email:
            delete_user_and_records(existing_user_by_email['id'])
            
        # Check if username is already used and wipe to avoid conflict
        existing_user_by_username = get_user_by_username(username) if username else None
        if existing_user_by_username:
            delete_user_and_records(existing_user_by_username['id'])
        
        # Create fresh user account
        user_id = create_user(username, email, password, first_name)
        if user_id:
            session['user_id'] = user_id
            log_activity(user_id, 'SIGNUP', 'New user registered (replaced legacy records)')
            return jsonify({'success': True, 'message': 'Account created successfully!', 'redirect': url_for('dashboard')})
        else:
            return jsonify({'success': False, 'message': 'Registration error occurred'})

    return render_template('signup.html')

@app.route('/logout')
def logout():
    user_id = session.get('user_id')
    if user_id:
        log_activity(user_id, 'LOGOUT', f'User logged out at {datetime.now()}')
    session.clear()
    return redirect(url_for('login'))

# ==========================================
# DASHBOARD & MAIN ROUTES
# ==========================================

@app.route('/dashboard')
@login_required
def dashboard():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    recent_sessions = get_user_study_sessions(user_id)
    user_opportunities = get_user_opportunities(user_id)
    recent_activities = get_user_activity(user_id)
    
    return render_template('dashboard_new.html', 
                          user=user, 
                          recent_sessions=recent_sessions,
                          user_opportunities=user_opportunities,
                          recent_activities=recent_activities)

# ==========================================
# STUDY AGENT ROUTE
# ==========================================

@app.route('/study', methods=['GET', 'POST'])
@login_required
def study():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    if request.method == 'POST':
        title = request.form.get('session_title', 'Study Session') # Subject Name
        scope = request.form.get('scope', 'Exam Focused')
        syllabus_file = request.files.get('syllabus')
        pqp_file = request.files.get('pqp')
        
        session_id = create_study_session(user_id, title)
        
        syllabus_text = ''
        pqp_text = ''
        
        # Extract text from syllabus PDF
        if syllabus_file and allowed_file(syllabus_file.filename):
            filename = secure_filename(syllabus_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            syllabus_file.save(filepath)
            
            try:
                with open(filepath, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    pages_text = []
                    char_count = 0
                    for page in reader.pages:
                        text = page.extract_text() or ''
                        pages_text.append(text)
                        char_count += len(text)
                        if char_count >= 5000:
                            break
                    syllabus_text = '\n'.join(pages_text)
            except Exception as e:
                print(f"Error reading syllabus PDF: {e}")
        
        # Extract text from PYQ PDF
        if pqp_file and allowed_file(pqp_file.filename):
            filename = secure_filename(pqp_file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
            pqp_file.save(filepath)
            
            try:
                with open(filepath, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    pages_text = []
                    char_count = 0
                    for page in reader.pages:
                        text = page.extract_text() or ''
                        pages_text.append(text)
                        char_count += len(text)
                        if char_count >= 5000:
                            break
                    pqp_text = '\n'.join(pages_text)
            except Exception as e:
                print(f"Error reading PYQ PDF: {e}")
        
        ai_engine = request.form.get('ai_engine', 'gemini')
        
        # Get AI-powered study plan incorporating syllabus, pyq, subject name and scope
        result = analyze_study_materials(
            syllabus_text, 
            pqp_text, 
            subject_name=title,
            scope=scope,
            ai_engine=ai_engine
        )
        
        if result['success']:
            important_topics = result.get('important_questions', [])
            study_priority = result.get('repeated_topics', [])
            weekly_plan = result.get('weekly_plan', [])
            
            save_study_analysis(
                session_id, 
                json.dumps(important_topics), 
                json.dumps(study_priority), 
                json.dumps(weekly_plan), 
                json.dumps(result)
            )
            log_activity(user_id, 'STUDY_SESSION', f'Created study session for: {title}')
        
        return jsonify({
            'success': result['success'],
            'message': 'Study session created and analyzed!',
            'session_id': session_id,
            'analysis': result
        })
    
    recent_sessions = get_user_study_sessions(user_id)
    return render_template('study.html', user=user, sessions=recent_sessions)


@app.route('/analyze-study-material', methods=['POST'])
@login_required
def analyze_study_material():
    user_id = session['user_id']
    title = request.form.get('session_title', 'Study Session') # Subject Name
    scope = request.form.get('scope', 'Exam Focused')
    syllabus_file = request.files.get('syllabus')
    pqp_file = request.files.get('pqp')
    
    session_id = create_study_session(user_id, title)
    
    syllabus_text = ''
    pqp_text = ''
    
    # Extract text from syllabus PDF
    if syllabus_file and allowed_file(syllabus_file.filename):
        filename = secure_filename(syllabus_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        syllabus_file.save(filepath)
        
        try:
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                pages_text = []
                char_count = 0
                for page in reader.pages:
                    text = page.extract_text() or ''
                    pages_text.append(text)
                    char_count += len(text)
                    if char_count >= 5000:
                        break
                syllabus_text = '\n'.join(pages_text)
        except Exception as e:
            print(f"Error reading syllabus PDF: {e}")
    
    # Extract text from PYQ PDF
    if pqp_file and allowed_file(pqp_file.filename):
        filename = secure_filename(pqp_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{session_id}_{filename}")
        pqp_file.save(filepath)
        
        try:
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                pages_text = []
                char_count = 0
                for page in reader.pages:
                    text = page.extract_text() or ''
                    pages_text.append(text)
                    char_count += len(text)
                    if char_count >= 5000:
                        break
                pqp_text = '\n'.join(pages_text)
        except Exception as e:
            print(f"Error reading PYQ PDF: {e}")
            
    ai_engine = request.form.get('ai_engine', 'gemini')
    
    result = analyze_study_materials(
        syllabus_text, 
        pqp_text, 
        subject_name=title,
        scope=scope,
        ai_engine=ai_engine
    )
    
    if result['success']:
        important_topics = result.get('important_questions', [])
        study_priority = result.get('repeated_topics', [])
        weekly_plan = result.get('weekly_plan', [])
        
        save_study_analysis(
            session_id, 
            json.dumps(important_topics), 
            json.dumps(study_priority), 
            json.dumps(weekly_plan), 
            json.dumps(result)
        )
        log_activity(user_id, 'STUDY_SESSION', f'Created study session for: {title}')
        
    return jsonify({
        'success': result['success'],
        'message': 'Study session created and analyzed!',
        'session_id': session_id,
        'analysis': result
    })

# ==========================================
# SCHOLARSHIPS ROUTE
# ==========================================

@app.route('/scholarships')
@login_required
def scholarships():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    # Sample scholarships data
    scholarships_data = [
        {
            'id': 1, 'title': 'KVPY Scholarship', 'organization': 'DST India',
            'award_amount': '500000', 'min_cgpa': 6.0, 'deadline': '2026-11-30',
            'category': 'merit', 'description': 'Exceptional merit-based scholarship for science students',
            'match_percentage': 85, 'link': '#'
        },
        {
            'id': 2, 'title': 'Google Scholarship', 'organization': 'Google',
            'award_amount': '1000000', 'min_cgpa': 7.5, 'deadline': '2026-12-15',
            'category': 'special', 'description': 'Technology and innovation focused scholarship',
            'match_percentage': 75, 'link': '#'
        },
    ]
    
    return render_template('scholarships.html', user=user, scholarships=scholarships_data)

# ==========================================
# INTERNSHIPS ROUTE
# ==========================================

@app.route('/internships')
@login_required
def internships():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    # Sample internships data
    internships_data = [
        {
            'id': 1, 'title': 'SDE Intern', 'company': 'Google',
            'type': 'summer', 'duration': '3 months', 'location': 'Bangalore',
            'stipend': '50000', 'deadline': '2026-06-30',
            'required_skills': 'Python, DSA, JavaScript',
            'description': 'Software Development Engineer Internship',
            'match_percentage': 90, 'link': '#'
        },
        {
            'id': 2, 'title': 'Data Science Intern', 'company': 'Amazon',
            'type': 'summer', 'duration': '3 months', 'location': 'Remote',
            'stipend': '45000', 'deadline': '2026-07-15',
            'required_skills': 'Python, SQL, ML',
            'description': 'Data Science and Analytics Internship',
            'match_percentage': 80, 'link': '#'
        },
    ]
    
    return render_template('internships.html', user=user, internships=internships_data)

# ==========================================
# OPPORTUNITIES ROUTE
# ==========================================

@app.route('/opportunities')
@login_required
def opportunities():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    user_opportunities = get_user_opportunities(user_id)
    
    return render_template('opportunities.html', user=user, opportunities=user_opportunities)

# ==========================================
# CODE AGENT ROUTE
# ==========================================

@app.route('/code-assistant', methods=['GET', 'POST'])
@login_required
def code_assistant():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json(silent=True) or {}
            code = data.get('code', '')
            language = data.get('language', 'python')
            ai_engine = data.get('ai_engine', 'gemini')
        else:
            code = request.form.get('code', '')
            language = request.form.get('language', 'python')
            ai_engine = request.form.get('ai_engine', 'gemini')
        
        if not code:
            return jsonify({
                'success': False,
                'message': 'Please enter code to analyze'
            })
        
        # Get AI analysis using Gemini service
        analysis_result = analyze_code(code, language, ai_engine=ai_engine)
        
        # Save analysis to database
        if analysis_result['success']:
            explanation = analysis_result.get('explanation', analysis_result.get('summary', ''))
            save_code_analysis(
                user_id, 
                code, 
                language, 
                explanation, 
                json.dumps(analysis_result.get('errors', [])),
                json.dumps(analysis_result.get('suggestions', [])),
                analysis_result.get('optimized_code', '')
            )
            log_activity(user_id, 'CODE_ANALYSIS', f'Analyzed {language} code ({len(code)} chars)')
        
        return jsonify({
            'success': analysis_result['success'],
            'analysis': analysis_result
        })
    
    history = get_code_analysis_history(user_id)
    api_status = get_api_status()
    return render_template('code-assistant.html', user=user, history=history, api_status=api_status)


@app.route('/analyze-code', methods=['POST'])
@login_required
def api_analyze_code():
    user_id = session['user_id']
    if request.is_json:
        data = request.get_json(silent=True) or {}
        code = data.get('code', '')
        language = data.get('language', 'python')
        ai_engine = data.get('ai_engine', 'gemini')
    else:
        code = request.form.get('code', '')
        language = request.form.get('language', 'python')
        ai_engine = request.form.get('ai_engine', 'gemini')
        
    if not code:
        return jsonify({'success': False, 'message': 'Please enter code to analyze'})
        
    result = analyze_code(code, language, ai_engine=ai_engine)
    if result['success']:
        explanation = result.get('explanation', result.get('summary', ''))
        save_code_analysis(
            user_id, 
            code, 
            language, 
            explanation, 
            json.dumps(result.get('errors', [])),
            json.dumps(result.get('suggestions', [])),
            result.get('optimized_code', '')
        )
        log_activity(user_id, 'CODE_ANALYSIS', f'Analyzed {language} code ({len(code)} chars)')
        
    return jsonify({'success': result['success'], 'analysis': result})

# ==========================================
# PROFILE ROUTE
# ==========================================

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    if request.method == 'POST':
        branch = request.form.get('branch', '')
        cgpa = request.form.get('cgpa', 0)
        
        try:
            cgpa = float(cgpa) if cgpa else None
        except:
            cgpa = None
        
        update_user_profile(user_id, branch, cgpa)
        log_activity(user_id, 'PROFILE_UPDATE', f'Updated profile')
        
        return jsonify({'success': True, 'message': 'Profile updated!'})
    
    return render_template('profile.html', user=user)

@app.route('/change-password', methods=['POST'])
@login_required
def change_password():
    user_id = session['user_id']
    
    if request.is_json:
        data = request.get_json() or {}
        current_password = data.get('current_password')
        new_password = data.get('new_password')
    else:
        current_password = request.form.get('current_password')
        new_password = request.form.get('new_password')
        
    if not current_password or not new_password:
        return jsonify({'success': False, 'message': 'All fields are required'})
        
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'})
        
    # Verify current password and upgrade legacy hash if needed
    if not verify_password(current_password, user['password'], user_id=user_id):
        return jsonify({'success': False, 'message': 'Incorrect current password'})
        
    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'New password must be at least 6 characters long'})
        
    # Hash and update password
    hashed_password = hash_password(new_password)
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', (hashed_password, user_id))
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})
        
    log_activity(user_id, 'PASSWORD_CHANGE', 'User changed their password')
    
    return jsonify({'success': True, 'message': 'Password updated successfully!'})

# ==========================================
# ACTIVITY LOG ROUTE
# ==========================================

@app.route('/activity')
@login_required
def activity():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    activities = get_user_activity(user_id)
    
    return render_template('activity.html', user=user, activities=activities)

# ==========================================
# ERROR HANDLERS
# ==========================================

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500

# ==========================================
# VERCEL DEPLOYMENT
# ==========================================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
