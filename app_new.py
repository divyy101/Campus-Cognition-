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
from services.gemini_service import analyze_study_materials, is_api_available

# Import database models
from database.models import (
    init_db, get_user_by_username, create_user, verify_password, get_user_by_id,
    create_study_session, save_study_analysis, get_user_study_sessions,
    create_opportunity, match_opportunities, save_user_opportunity, get_user_opportunities,
    save_code_analysis, get_code_analysis_history, log_activity, get_user_activity,
    update_user_profile, get_all_opportunities, insert_sample_opportunities
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
        
        if user and verify_password(password, user['password']):
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

        user_id = create_user(username, email, password, first_name)
        if user_id:
            return jsonify({'success': True, 'message': 'Account created successfully!', 'redirect': url_for('login')})
        else:
            return jsonify({'success': False, 'message': 'Username or email already exists'})

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
        title = request.form.get('session_title', 'Study Session')
        syllabus_file = request.files.get('syllabus')
        pqp_file = request.files.get('pqp')
        
        # New parameters
        topic_names = request.form.get('topic_names', '')
        unit_analysis = request.form.get('unit_analysis', '')
        important_topics_custom = request.form.get('important_topics_custom', '')
        time_slot = request.form.get('time_slot', '2 Hours/Day')
        
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
                    syllabus_text = '\n'.join([page.extract_text() for page in reader.pages])
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
                    pqp_text = '\n'.join([page.extract_text() for page in reader.pages])
            except Exception as e:
                print(f"Error reading PYQ PDF: {e}")
        
        # Parse custom topics provided by the student
        custom_topics = [t.strip().capitalize() for t in topic_names.split(',') if t.strip()]
        
        # Extract topics from text
        topics = Counter()
        for text in [syllabus_text, pqp_text]:
            if text:
                import re
                words = re.findall(r'[a-zA-Z]{4,}', text.lower())
                topics.update(words)
        
        top_topics = [t.capitalize() for t, _ in topics.most_common(12)]
        
        # Merge custom topics into top_topics at the top
        for ct in reversed(custom_topics):
            if ct in top_topics:
                top_topics.remove(ct)
            top_topics.insert(0, ct)
            
        if not top_topics:
            top_topics = ["Introduction", "Core Concepts", "Advanced Theories", "Practical Exercises", "Revision & Mock Tests"]
            
        priority_list = []
        for i, (topic, count) in enumerate(topics.most_common(10)):
            score = min(99, max(50, 75 + count * 2 - i * 3))
            priority_list.append({
                'topic': topic.capitalize(),
                'priority_score': score
            })
            
        # Add custom topics to priority_list first if they aren't already there
        for ct in custom_topics:
            exists = False
            for p in priority_list:
                if p['topic'].lower() == ct.lower():
                    exists = True
                    p['priority_score'] = 98 # Mark custom focus as extremely high priority
                    break
            if not exists:
                priority_list.insert(0, {
                    'topic': ct,
                    'priority_score': 98
                })
                
        if not priority_list:
            priority_list = [
                {'topic': 'Core Concepts', 'priority_score': 95},
                {'topic': 'Advanced Theories', 'priority_score': 85},
                {'topic': 'Revision & Mock Tests', 'priority_score': 80}
            ]
            
        # Dynamic daily hours based on preferred study time slot
        daily_hours = 2
        if "1-2" in time_slot or "Light" in time_slot:
            daily_hours = 2
        elif "3-4" in time_slot or "Medium" in time_slot or "Moderate" in time_slot:
            daily_hours = 4
        elif "5+" in time_slot or "Intense" in time_slot or "Heavy" in time_slot:
            daily_hours = 6
            
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_plan = []
        for i, day in enumerate(days):
            day_topics = []
            if top_topics:
                day_topics.append(top_topics[i % len(top_topics)])
                if i % 2 == 0 and len(top_topics) > 1:
                    day_topics.append(top_topics[(i + 3) % len(top_topics)])
            else:
                day_topics = ["General Study"]
            weekly_plan.append({
                'day': day,
                'duration_hours': daily_hours if i < 5 else (daily_hours + 2),
                'topics': day_topics
            })
            
        # Get AI-powered study plan incorporating all details
        study_plan = ''
        result = analyze_study_materials(
            syllabus_text, 
            pqp_text, 
            topic_names=topic_names, 
            unit_analysis=unit_analysis, 
            important_topics=important_topics_custom, 
            time_slot=time_slot
        )
        if result['success']:
            study_plan = result['plan']
        else:
            study_plan = "AI analysis unavailable at this moment. Please try again later."
            
        analysis_obj = {
            'important_topics': top_topics,
            'priority_list': priority_list,
            'weekly_plan': weekly_plan,
            'full_plan': study_plan
        }
        
        save_study_analysis(
            session_id, 
            json.dumps(top_topics), 
            json.dumps(priority_list), 
            json.dumps(weekly_plan), 
            study_plan
        )
        log_activity(user_id, 'STUDY_SESSION', f'Created study session: {title}')
        
        return jsonify({
            'success': True,
            'message': 'Study session created and analyzed!',
            'session_id': session_id,
            'analysis': analysis_obj
        })
    
    recent_sessions = get_user_study_sessions(user_id)
    return render_template('study.html', user=user, sessions=recent_sessions)

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
        # Accept both JSON and form data
        if request.is_json:
            data = request.get_json(silent=True) or {}
            code = data.get('code', '')
            language = data.get('language', 'python')
        else:
            code = request.form.get('code', '')
            language = request.form.get('language', 'python')

        analysis_result = {'explanation': '', 'errors': [], 'suggestions': [], 'optimized_code': code}

        if GEMINI_API_KEY:
            try:
                model = genai.GenerativeModel('gemini-pro')
                prompt = f"Analyze this {language} code:\n\n{code}\n\nProvide: 1) Explanation 2) Errors found 3) Suggestions 4) Optimized code"
                response = model.generate_content(prompt)
                analysis_result['explanation'] = response.text
            except Exception as e:
                analysis_result['explanation'] = f'Analysis unavailable: {str(e)}'

        save_code_analysis(user_id, code, language, 
                          analysis_result['explanation'], 
                          json.dumps(analysis_result['errors']),
                          json.dumps(analysis_result['suggestions']),
                          analysis_result['optimized_code'])
        log_activity(user_id, 'CODE_ANALYSIS', f'Analyzed {language} code')

        return jsonify({'success': True, 'analysis': analysis_result})
    
    history = get_code_analysis_history(user_id)
    return render_template('code-assistant.html', user=user, history=history)

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
