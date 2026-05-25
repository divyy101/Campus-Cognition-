import os
import json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_session import Session
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import PyPDF2
from collections import Counter
from functools import wraps
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import AI services
from services.gemini_service import (
    analyze_study_materials,
    analyze_code,
    recommend_opportunities,
    analyze_scholarship,
    analyze_internship,
    is_api_available,
    get_api_status,
    fetch_live_scholarships,
    fetch_live_internships,
    get_default_scholarships,
    get_default_internships,
    fetch_live_opportunities
)

# Import database models
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'database'))
from models import (
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
        if request.is_json:
            data = request.get_json() or {}
            username = data.get('username')
            password = data.get('password')
        else:
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
        if request.is_json:
            data = request.get_json() or {}
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
        else:
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            first_name = request.form.get('first_name', '')
            last_name = request.form.get('last_name', '')
        
        # Check if email is already used to register and wipe previous data to allow fresh replacement
        existing_user_by_email = get_user_by_email(email) if email else None
        if existing_user_by_email:
            delete_user_and_records(existing_user_by_email['id'])
            
        # Check if username is already used and wipe to avoid conflict
        existing_user_by_username = get_user_by_username(username) if username else None
        if existing_user_by_username:
            delete_user_and_records(existing_user_by_username['id'])
        
        # Create fresh user account
        if create_user(username, email, password, first_name, last_name):
            new_user = get_user_by_username(username)
            if new_user:
                session['user_id'] = new_user['id']
                log_activity(new_user['id'], 'SIGNUP', 'New user registered (replaced legacy records)')
            return jsonify({'success': True, 'message': 'Account created successfully!', 'redirect': url_for('dashboard')})
        
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
    
    # Serving default/fallback options initially for quick page response
    scholarships_data = get_default_scholarships()
    
    return render_template('scholarships.html', user=user, scholarships=scholarships_data)

# ==========================================
# INTERNSHIPS ROUTE
# ==========================================

@app.route('/internships')
@login_required
def internships():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    # Serving default/fallback options initially for quick page response
    internships_data = get_default_internships()
    
    return render_template('internships.html', user=user, internships=internships_data)

# ==========================================
# AI DYNAMIC SEARCH / EXPLORATION API ROUTES
# ==========================================

@app.route('/api/explore-scholarships', methods=['POST'])
@login_required
def api_explore_scholarships():
    """API endpoint to dynamically crawl scholarships using AI proxy."""
    data = request.get_json() or {}
    branch = data.get('branch', '')
    cgpa_val = data.get('cgpa', '')
    query = data.get('query', '')
    
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    # Use default user values if not customized
    branch = branch or user['branch'] or 'CSE'
    try:
        cgpa = float(cgpa_val) if cgpa_val else float(user['cgpa'] or 8.0)
    except (ValueError, TypeError):
        cgpa = 8.0
        
    # Crawl the web via live AI proxy matching custom search criteria
    scholarships_data = fetch_live_scholarships(branch, cgpa, query)
    
    log_activity(user_id, 'SCHOLARSHIP_AI_EXPLORE', f'AI explored scholarships for branch={branch}, cgpa={cgpa}, query={query}')
    
    return jsonify({
        'success': True,
        'scholarships': scholarships_data
    })

@app.route('/api/explore-internships', methods=['POST'])
@login_required
def api_explore_internships():
    """API endpoint to dynamically crawl internships using AI proxy."""
    data = request.get_json() or {}
    branch = data.get('branch', '')
    cgpa_val = data.get('cgpa', '')
    query = data.get('query', '')
    
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    # Use default user values if not customized
    branch = branch or user['branch'] or 'CSE'
    try:
        cgpa = float(cgpa_val) if cgpa_val else float(user['cgpa'] or 8.0)
    except (ValueError, TypeError):
        cgpa = 8.0
        
    # Crawl the web via live AI proxy matching custom search criteria
    internships_data = fetch_live_internships(branch, cgpa, query)
    
    log_activity(user_id, 'INTERNSHIP_AI_EXPLORE', f'AI explored internships for branch={branch}, cgpa={cgpa}, query={query}')
    
    return jsonify({
        'success': True,
        'internships': internships_data
    })

# ==========================================
# OPPORTUNITIES ROUTE
# ==========================================

@app.route('/opportunities', methods=['GET', 'POST'])
@login_required
def opportunities():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json() or {}
            role = data.get('role', '')
            branch = data.get('branch', '')
            cgpa_val = data.get('cgpa', '')
            skills_str = data.get('skills', '')
        else:
            role = request.form.get('role', '')
            branch = request.form.get('branch', '')
            cgpa_val = request.form.get('cgpa', '')
            skills_str = request.form.get('skills', '')
            
        # Synchronize profile branch and CGPA
        try:
            cgpa = float(cgpa_val) if cgpa_val else user['cgpa']
        except (ValueError, TypeError):
            cgpa = user['cgpa']
            
        branch = branch or user['branch'] or 'CSE'
        
        if branch or cgpa:
            update_user_profile(user_id, branch, cgpa)
            user = get_user_by_id(user_id)
            
        # Get dynamically crawled/generated AI matching opportunities
        try:
            matched_opps = fetch_live_opportunities(
                branch=branch,
                cgpa=cgpa or 8.0,
                role=role,
                skills=skills_str
            )
        except Exception as e:
            print(f"Error fetching live opportunities: {e}")
            from services.gemini_service import simulate_live_opportunities
            matched_opps = simulate_live_opportunities(branch, cgpa or 8.0, role, skills_str)
            
        formatted_matches = []
        for opp in matched_opps:
            # Safely check / save to opportunities master table in DB to prevent duplicates
            opp_id = opp.get('id')
            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('SELECT id FROM opportunities WHERE title = ? AND company = ?', (opp['title'], opp['company']))
                row = c.fetchone()
                if row:
                    opp_id = row['id']
                else:
                    c.execute('''
                    INSERT INTO opportunities (title, company, description, required_skills, required_branch, min_cgpa, deadline, link, type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        opp['title'], 
                        opp['company'], 
                        opp['description'], 
                        opp.get('required_skills', skills_str), 
                        branch, 
                        cgpa or 6.0, 
                        opp.get('deadline', '2026-12-31'), 
                        opp.get('link', '#'), 
                        opp.get('type', 'Full-time')
                    ))
                    conn.commit()
                    opp_id = c.lastrowid
                conn.close()
            except Exception as dbe:
                print(f"DB insert opportunity error: {dbe}")
                
            # Link matched opportunity to user
            if opp_id:
                try:
                    save_user_opportunity(user_id, opp_id, opp['match_percentage'])
                except Exception as save_err:
                    print(f"Error linking user opportunity: {save_err}")
                    
            formatted_matches.append({
                'id': opp_id or opp.get('id'),
                'title': opp['title'],
                'company': opp['company'],
                'description': opp['description'],
                'match_percentage': opp['match_percentage'],
                'type': opp.get('type', 'Full-time'),
                'deadline': opp.get('deadline', 'N/A'),
                'link': opp.get('link', '#')
            })
            
        log_activity(user_id, 'OPPORTUNITY_AI_EXPLORE', f'AI searched opportunities for role={role}, branch={branch}, cgpa={cgpa}')
            
        return jsonify({
            'success': True,
            'message': f'AI Crawler found {len(formatted_matches)} matching opportunities!',
            'matched_opportunities': formatted_matches
        })
        
    user_opportunities = get_user_opportunities(user_id)
    return render_template('opportunities.html', user=user, opportunities=user_opportunities)

# ==========================================
# AI SCHOLARSHIP ANALYSIS API
# ==========================================

@app.route('/api/analyze-scholarship', methods=['POST'])
@login_required
def api_analyze_scholarship():
    """API endpoint for AI scholarship analysis"""
    data = request.get_json()
    
    scholarship_info = data.get('scholarship_info', '')
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    if not scholarship_info:
        return jsonify({'success': False, 'message': 'Scholarship information required'})
    
    result = analyze_scholarship(
        scholarship_info,
        user.get('branch', 'Not specified'),
        user.get('cgpa', 0),
        data.get('achievements', '')
    )
    
    log_activity(user_id, 'SCHOLARSHIP_ANALYSIS', f'Analyzed scholarship')
    
    return jsonify(result)

# ==========================================
# AI INTERNSHIP ANALYSIS API
# ==========================================

@app.route('/api/analyze-internship', methods=['POST'])
@login_required
def api_analyze_internship():
    """API endpoint for AI internship analysis"""
    data = request.get_json()
    
    internship_info = data.get('internship_info', '')
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    if not internship_info:
        return jsonify({'success': False, 'message': 'Internship information required'})
    
    result = analyze_internship(
        internship_info,
        user.get('branch', 'Not specified'),
        data.get('skills', ''),
        data.get('experience', ''),
        user.get('cgpa', 0)
    )
    
    log_activity(user_id, 'INTERNSHIP_ANALYSIS', f'Analyzed internship')
    
    return jsonify(result)

# ==========================================
# AI RECOMMENDATIONS API
# ==========================================

@app.route('/api/get-recommendations', methods=['POST'])
@login_required
def api_get_recommendations():
    """API endpoint for AI-powered opportunity recommendations"""
    data = request.get_json()
    
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    
    opportunities_str = json.dumps(data.get('opportunities', []))
    
    result = recommend_opportunities(
        user.get('branch', 'Not specified'),
        user.get('cgpa', 0),
        data.get('skills', ''),
        data.get('interests', ''),
        opportunities_str
    )
    
    log_activity(user_id, 'GET_RECOMMENDATIONS', f'Generated AI recommendations')
    
    return jsonify(result)

# ==========================================
# API STATUS CHECK
# ==========================================

@app.route('/api/ai-status', methods=['GET'])
@login_required
def api_ai_status():
    """Check AI service status"""
    return jsonify(get_api_status())

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
            data = request.get_json() or {}
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
        data = request.get_json() or {}
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
        if request.is_json:
            data = request.get_json() or {}
            branch = data.get('branch', '')
            cgpa = data.get('cgpa', 0)
        else:
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
# STUDY DETAILS ENDPOINT
# ==========================================

@app.route('/study/<int:session_id>')
@login_required
def get_study_session_details(session_id):
    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?', (session_id, user_id))
    session_row = c.fetchone()
    conn.close()
    
    if not session_row:
        return jsonify({'success': False, 'message': 'Session not found'}), 404
        
    try:
        important_topics = json.loads(session_row['important_topics']) if session_row['important_topics'] else []
    except Exception:
        important_topics = []
        
    try:
        priority_list = json.loads(session_row['study_priority']) if session_row['study_priority'] else []
    except Exception:
        priority_list = []
        
    try:
        weekly_plan = json.loads(session_row['weekly_plan']) if session_row['weekly_plan'] else []
    except Exception:
        weekly_plan = []
        
    return jsonify({
        'success': True,
        'session': {
            'id': session_row['id'],
            'title': session_row['title'],
            'created_at': session_row['created_at'],
            'important_topics': important_topics,
            'priority_list': priority_list,
            'weekly_plan': weekly_plan,
            'full_plan': session_row['charts_data'] or ''
        }
    })

# ==========================================
# CODE ANALYSIS DETAILS ENDPOINT
# ==========================================

@app.route('/code-assistant/<int:analysis_id>')
@login_required
def get_code_analysis_details(analysis_id):
    user_id = session['user_id']
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM code_analysis WHERE id = ? AND user_id = ?', (analysis_id, user_id))
    analysis_row = c.fetchone()
    conn.close()
    
    if not analysis_row:
        return jsonify({'success': False, 'message': 'Analysis not found'}), 404
        
    try:
        errors = json.loads(analysis_row['errors']) if analysis_row['errors'] else []
    except Exception:
        errors = []
        
    try:
        suggestions = json.loads(analysis_row['suggestions']) if analysis_row['suggestions'] else []
    except Exception:
        suggestions = []
        
    return jsonify({
        'success': True,
        'analysis': {
            'id': analysis_row['id'],
            'language': analysis_row['language'],
            'code': analysis_row['code'],
            'explanation': analysis_row['explanation'],
            'errors': errors,
            'suggestions': suggestions,
            'optimized_code': analysis_row['optimized_code'],
            'created_at': analysis_row['created_at']
        }
    })

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
