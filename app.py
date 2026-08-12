"""
Campus Cognition V2 — Main Flask Application
MongoDB-backed, dual AI provider, secure API proxy.
"""

import os
import json
import hashlib
import secrets
import re
import logging
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_session import Session
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta, timezone
import PyPDF2
from functools import wraps
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(name)s — %(message)s',
)
logger = logging.getLogger('campus_cognition')

# ---------------------------------------------------------------------------
# Import AI services
# ---------------------------------------------------------------------------
from services.ai_service import (
    analyze_study_materials,
    recommend_opportunities,
    analyze_scholarship,
    analyze_internship,
    analyze_code,
    is_api_available,
    get_api_status,
    fetch_live_scholarships,
    fetch_live_internships,
    get_default_scholarships,
    get_default_internships,
    fetch_live_opportunities
)
from services.search_service import execute_opportunities_search


# ---------------------------------------------------------------------------
# Import MongoDB repositories
# ---------------------------------------------------------------------------
from database.mongodb import get_db, health_check as db_health_check, init_indexes
from database.repositories.user_repository import (
    create_user, get_user_by_username, get_user_by_email, get_user_by_id,
    verify_password, hash_password, update_user_profile, update_password,
    create_password_reset_token, consume_password_reset_token,
)
from database.repositories.study_repository import (
    create_study_session, save_study_analysis, get_user_study_sessions,
    get_study_session,
)
from database.repositories.code_repository import (
    save_code_analysis, get_code_analysis_history, get_code_analysis,
)
from database.repositories.opportunity_repository import (
    create_opportunity, get_all_opportunities, save_user_opportunity,
    get_user_opportunities, insert_sample_opportunities, search_opportunities,
    get_cached_search, set_cached_search,
)
from database.repositories.activity_repository import (
    log_activity, get_user_activity,
)
from services.email_service import send_welcome_email, send_password_reset_email
from services.document_processor import process_document, generate_file_hash, validate_document_file
from services.document_pipeline import trigger_document_pipeline
from database.repositories.document_repository import get_document, semantic_search_chunks
from services.ai_service import answer_rag_question
from services.embedding_service import generate_text_embedding
from services.roadmap_service import get_next_best_action, update_topic_mastery

# ---------------------------------------------------------------------------
# Initialize Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'campus-cognition-v2-change-me')

# Vercel Serverless configurations
if os.environ.get('VERCEL'):
    app.config['UPLOAD_FOLDER'] = '/tmp'
else:
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    Session(app)

# 700 MB max upload
app.config['MAX_CONTENT_LENGTH'] = 700 * 1024 * 1024

# ---------------------------------------------------------------------------
# Security headers middleware
# ---------------------------------------------------------------------------
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'md', 'pptx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def api_response(success=True, data=None, message='', error=None, status_code=200):
    """Standardized API response."""
    body = {
        'success': success,
        'data': data,
        'message': message,
        'error': error,
    }
    return jsonify(body), status_code

def _get_ai_engine(request_obj, user=None):
    """Extract AI engine preference from request or user profile."""
    engine = None
    if request_obj.is_json:
        engine = (request_obj.get_json(silent=True) or {}).get('ai_engine')
    if not engine:
        engine = request_obj.form.get('ai_engine') or request_obj.args.get('ai_engine')
    if not engine:
        engine = session.get('ai_engine')
    if not engine and user:
        engine = user.get('ai_engine')
    return engine or 'gemini'

# ==========================================
# SYSTEM ROUTES
# ==========================================

@app.route('/health')
def health_check():
    """Fast health check for Vercel and monitoring."""
    try:
        db_ok = db_health_check()
        if db_ok and db_ok.get('status') == 'connected':
            return jsonify({"status": "healthy", "database": "connected"}), 200
        return jsonify({"status": "unhealthy", "database": "disconnected"}), 503
    except Exception as e:
        logger.error("Health check failed: %s", e)
        return jsonify({"status": "unhealthy", "database": "error"}), 503

@app.route('/api/admin/init-db', methods=['POST'])
def manual_init_db():
    """Manual trigger to initialize MongoDB indexes and samples."""
    try:
        init_indexes()
        insert_sample_opportunities()
        return jsonify({"success": True, "message": "Database initialized successfully"}), 200
    except Exception as e:
        logger.error("Database initialization failed: %s", e)
        return jsonify({"success": False, "message": "Database initialization failed"}), 500

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
            session['user_id'] = str(user['id'])
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

        username = (username or '').strip()
        email = (email or '').strip().lower()
        if len(username) < 3 or not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email):
            return jsonify({'success': False, 'message': 'Enter a valid username and email address.'}), 400
        if not password or len(password) < 6:
            return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400
        if get_user_by_email(email):
            return jsonify({'success': False, 'message': 'An account already exists for this email. Please log in or reset your password.'}), 409
        if get_user_by_username(username):
            return jsonify({'success': False, 'message': 'That username is already in use. Please choose another.'}), 409

        user_id = create_user(username, email, password, first_name, last_name)
        if user_id:
            email_sent = False
            new_user = get_user_by_id(user_id)
            if new_user:
                session['user_id'] = str(new_user['id'])
                log_activity(str(new_user['id']), 'SIGNUP', 'New user registered')
                try:
                    email_sent = send_welcome_email(new_user)
                except Exception as e:
                    logger.error(f"Failed to send welcome email: {e}")
                    email_sent = False

            return jsonify({'success': True, 'message': 'Account created successfully!' + (' A welcome email was sent.' if email_sent else ''), 'redirect': url_for('dashboard')})

        return jsonify({'success': False, 'message': 'Registration error occurred'})

    return render_template('signup.html')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        email = (data.get('email') or '').strip().lower()

        client_ip = request.remote_addr
        rate_key = f'reset_limit_{client_ip}'
        attempts = session.get(rate_key, 0)

        if attempts >= 3:
            return jsonify({'success': False, 'message': 'Too many requests. Please try again later.'}), 429

        session[rate_key] = attempts + 1
        session.modified = True

        user = get_user_by_email(email) if email else None
        message = 'If an account exists for this email, a password reset link has been sent.'

        if user:
            raw_token = secrets.token_urlsafe(32)
            create_password_reset_token(
                user['id'],
                hashlib.sha256(raw_token.encode()).hexdigest(),
                datetime.now(timezone.utc) + timedelta(minutes=30),
            )

            frontend_url = os.getenv('FRONTEND_URL')
            if frontend_url:
                reset_url = f"{frontend_url.rstrip('/')}/reset-password/{raw_token}"
            else:
                reset_url = url_for('reset_password', token=raw_token, _external=True)

            try:
                send_password_reset_email(user, reset_url)
            except Exception as e:
                logger.error(f"Failed to send reset email: {e}")

            log_activity(user['id'], 'PASSWORD_RESET_REQUEST', 'Password reset link requested')

        return jsonify({'success': True, 'message': message})
    return render_template('forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        password = data.get('password') or ''
        confirm_password = data.get('confirm_password') or ''

        if len(password) < 8 or password != confirm_password:
            return jsonify({'success': False, 'message': 'Passwords must match and contain at least 8 characters.'}), 400

        user_id = consume_password_reset_token(token_hash)
        if not user_id:
            return jsonify({'success': False, 'message': 'This reset link is invalid or has expired.'}), 400

        update_password(user_id, hash_password(password))
        log_activity(user_id, 'PASSWORD_RESET', 'Password reset using email link')

        try:
            user = get_user_by_id(user_id)
            if user:
                from services.email_service import send_password_changed_email
                send_password_changed_email(user)
        except Exception as e:
            logger.error(f"Failed to send password changed email: {e}")

        return jsonify({'success': True, 'message': 'Password reset successfully. You can now log in.', 'redirect': url_for('login')})
    return render_template('reset_password.html', token=token)

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
# STUDY AGENT ROUTE — Two-file workflow (Syllabus Required + Notes Optional)
# ==========================================

@app.route('/study', methods=['GET', 'POST'])
@login_required
def study():
    user_id = session['user_id']
    user = get_user_by_id(user_id)

    if request.method == 'POST':
        title = request.form.get('session_title', 'Study Session')
        scope = request.form.get('scope', 'Exam Focused')
        ai_engine = _get_ai_engine(request, user)
        syllabus_file = request.files.get('syllabus')
        notes_file = request.files.get('notes')  # Optional

        # Syllabus is REQUIRED
        if not syllabus_file or syllabus_file.filename == '':
            return jsonify({'success': False, 'message': 'Syllabus file is required. Please upload your syllabus.'})

        try:
            # Process syllabus
            syl_filename = secure_filename(syllabus_file.filename)
            syl_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_syl_{syl_filename}")
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            syllabus_file.save(syl_filepath)

            # Validate syllabus
            syl_ext = validate_document_file(syl_filepath)
            syl_hash = generate_file_hash(syl_filepath)
            syl_size = os.path.getsize(syl_filepath)

            # Extract syllabus text
            _, syllabus_text = process_document(syl_filepath)

            # Process optional notes
            notes_text = ""
            if notes_file and notes_file.filename:
                notes_filename = secure_filename(notes_file.filename)
                notes_filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_notes_{notes_filename}")
                notes_file.save(notes_filepath)
                try:
                    validate_document_file(notes_filepath)
                    _, notes_text = process_document(notes_filepath)
                except Exception as ne:
                    logger.warning(f"Notes processing failed (continuing without): {ne}")
                finally:
                    if os.path.exists(notes_filepath):
                        os.remove(notes_filepath)

            # Run AI analysis
            analysis = analyze_study_materials(
                syllabus_text=syllabus_text,
                notes_text=notes_text,
                subject_name=title,
                scope=scope,
                ai_engine=ai_engine
            )

            if not analysis.get('success'):
                return jsonify({'success': False, 'message': 'AI analysis could not be completed. Please try again.'})

            # Save to database
            session_id = create_study_session(user_id, title)
            important_topics = analysis.get('important_questions', [])
            study_priority = analysis.get('repeated_topics', [])
            weekly_plan = analysis.get('weekly_plan', [])

            save_study_analysis(
                session_id,
                json.dumps(important_topics),
                json.dumps(study_priority),
                json.dumps(weekly_plan),
                json.dumps(analysis)
            )

            log_activity(user_id, 'STUDY_ANALYSIS', f'Analyzed syllabus: {title}')

            # Cleanup
            if os.path.exists(syl_filepath):
                os.remove(syl_filepath)

            return jsonify({
                'success': True,
                'message': 'Study plan generated successfully!',
                'analysis': analysis,
                'session_id': session_id
            })

        except ValueError as ve:
            logger.error(f'Validation error: {ve}')
            return jsonify({'success': False, 'message': str(ve)})
        except Exception as e:
            logger.error(f'Study upload error: {e}')
            return jsonify({'success': False, 'message': 'An error occurred during analysis. Please try again.'})

    recent_sessions = get_user_study_sessions(user_id)
    return render_template('study.html', user=user, sessions=recent_sessions)


# ==========================================
# DOCUMENT STATUS API  (Bug #3 fix — was missing @app.route decorator)
# ==========================================

@app.route('/api/document/<document_id>/status')
@login_required
def api_document_status(document_id):
    """Check the processing status of a document."""
    user_id = session['user_id']
    doc = get_document(document_id, user_id=user_id)

    if not doc:
        return jsonify({'success': False, 'message': 'Document not found'}), 404

    return jsonify({
        'success': True,
        'status': doc.get('status'),
        'document_id': doc.get('id'),
        'analysis': doc.get('analysis') if doc.get('status') == 'COMPLETED' else None
    })

# ==========================================
# CHUNK UPLOAD API (for large files)
# ==========================================

@app.route('/api/upload/chunk', methods=['POST'])
@login_required
def api_upload_chunk():
    """Receives a file chunk and saves it to a temporary directory."""
    import tempfile

    chunk = request.files.get('chunk')
    file_id = request.form.get('file_id')
    chunk_index = request.form.get('chunk_index')

    if not chunk or not file_id or chunk_index is None:
        return jsonify({'success': False, 'message': 'Missing chunk data'}), 400

    temp_dir = os.path.join(tempfile.gettempdir(), 'campus_cognition_uploads', file_id)
    os.makedirs(temp_dir, exist_ok=True)

    chunk_path = os.path.join(temp_dir, f'chunk_{chunk_index}')
    chunk.save(chunk_path)

    return jsonify({'success': True})

@app.route('/api/upload/complete', methods=['POST'])
@login_required
def api_upload_complete():
    """Assembles chunks and triggers document pipeline."""
    import tempfile
    import shutil

    user_id = session['user_id']
    user = get_user_by_id(user_id)

    file_id = request.form.get('file_id')
    filename = request.form.get('filename')
    total_chunks = int(request.form.get('total_chunks', 0))
    title = request.form.get('session_title', 'Study Session')
    scope = request.form.get('scope', 'Exam Focused')
    ai_engine = _get_ai_engine(request, user)

    if not file_id or not filename or total_chunks == 0:
        return jsonify({'success': False, 'message': 'Missing upload data'}), 400

    temp_dir = os.path.join(tempfile.gettempdir(), 'campus_cognition_uploads', file_id)
    secure_name = secure_filename(filename)
    final_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{user_id}_{secure_name}")

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    try:
        with open(final_path, 'wb') as final_file:
            for i in range(total_chunks):
                chunk_path = os.path.join(temp_dir, f'chunk_{i}')
                if not os.path.exists(chunk_path):
                    return jsonify({'success': False, 'message': f'Missing chunk {i}'}), 400
                with open(chunk_path, 'rb') as chunk_file:
                    final_file.write(chunk_file.read())

        shutil.rmtree(temp_dir, ignore_errors=True)

        file_size = os.path.getsize(final_path)
        ext = validate_document_file(final_path)
        doc_hash = generate_file_hash(final_path)

        doc_id = trigger_document_pipeline(
            user_id=user_id,
            filepath=final_path,
            filename=secure_name,
            file_type=ext,
            file_size=file_size,
            doc_hash=doc_hash,
            title=title,
            scope=scope,
            ai_engine=ai_engine
        )

        return jsonify({
            'success': True,
            'message': 'Document assembled and processing started.',
            'document_id': doc_id
        })
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)})
    except Exception as e:
        logger.error(f'Upload assembly error: {e}')
        return jsonify({'success': False, 'message': 'An error occurred during file assembly.'})


# ==========================================
# RAG Q&A API
# ==========================================

@app.route('/api/rag/ask', methods=['POST'])
@login_required
def ask_rag():
    """Endpoint for asking a question about uploaded documents."""
    user_id = session['user_id']
    data = request.get_json()
    question = data.get('question')

    if not question:
        return jsonify({'success': False, 'message': 'Question is required'}), 400

    query_embedding = generate_text_embedding(question)
    if not query_embedding:
        return jsonify({'success': False, 'message': 'Failed to process question embedding'}), 500

    chunks = semantic_search_chunks(user_id, query_embedding, limit=5)

    ai_engine = _get_ai_engine(request)
    answer = answer_rag_question(question, chunks, ai_engine)

    return jsonify({
        'success': True,
        'answer': answer,
        'sources': [c.get('section') for c in chunks]
    })

# ==========================================
# STUDY HELPER APIs
# ==========================================

@app.route('/api/study/next-action', methods=['GET'])
@login_required
def api_next_action():
    user_id = session['user_id']
    action = get_next_best_action(user_id)
    if not action:
        return jsonify({'success': False, 'message': 'No study actions available.'})
    return jsonify({'success': True, 'action': action})

@app.route('/api/study/mastery', methods=['POST'])
@login_required
def api_update_mastery():
    user_id = session['user_id']
    data = request.get_json()
    session_id = data.get('session_id')
    topic = data.get('topic')
    score = data.get('score')
    if not all([session_id, topic, score is not None]):
        return jsonify({'success': False, 'message': 'Missing fields'}), 400
    update_topic_mastery(user_id, session_id, topic, int(score))
    return jsonify({'success': True})

@app.route('/api/ai/copilot', methods=['POST'])
@login_required
def api_ai_copilot():
    """Central AI Copilot router."""
    data = request.get_json()
    message = data.get('message', '').lower()

    if 'internship' in message or 'job' in message or 'career' in message:
        intent = 'CAREER'
        response = "I can help with your career! Head to Opportunities to find internships matching your skills."
    elif 'code' in message or 'bug' in message or 'python' in message or 'java' in message:
        intent = 'CODE'
        response = "Need coding help? Head to Code Lab to paste your code for AI review."
    elif 'study' in message or 'exam' in message or 'notes' in message:
        intent = 'STUDY'
        response = "Upload your syllabus and notes in Study Agent to generate a personalized roadmap!"
    else:
        intent = 'GENERAL'
        response = "I am Campus AI. I can help you study, review code, and find career opportunities."

    return jsonify({'success': True, 'intent': intent, 'response': response})

# ==========================================
# SCHOLARSHIPS ROUTE
# ==========================================

@app.route('/scholarships')
@login_required
def scholarships():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))

    if query:
        results = execute_opportunities_search(query + " scholarship", user, page=page)
    else:
        results = execute_opportunities_search("scholarship", user, page=page)
        query = ""

    items = results if isinstance(results, list) else results.get('results', [])
    return render_template('scholarships.html', user=user, query=query, items=items, page=page, total_pages=1, has_next=False)

# ==========================================
# INTERNSHIPS ROUTE
# ==========================================

@app.route('/internships')
@login_required
def internships():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))

    if query:
        results = execute_opportunities_search(query + " internship", user, page=page)
    else:
        results = execute_opportunities_search("internship", user, page=page)
        query = ""

    items = results if isinstance(results, list) else results.get('results', [])
    return render_template('internships.html', user=user, query=query, items=items, page=page, total_pages=1, has_next=False)

# ==========================================
# AI DYNAMIC SEARCH / EXPLORATION API ROUTES
# ==========================================

@app.route('/api/explore-scholarships', methods=['POST'])
@login_required
def api_explore_scholarships():
    """API endpoint to dynamically crawl scholarships."""
    data = request.get_json() or {}
    branch = data.get('branch', '')
    cgpa_val = data.get('cgpa', '')
    query = data.get('query', '')

    user_id = session['user_id']
    user = get_user_by_id(user_id)
    ai_engine = data.get('ai_engine') or _get_ai_engine(request, user)

    branch = branch or (user.get('branch') if user else '') or 'CSE'
    try:
        cgpa = float(cgpa_val) if cgpa_val else float((user.get('cgpa') if user else None) or 8.0)
    except (ValueError, TypeError):
        cgpa = 8.0

    user_profile = {
        "id": user_id, "branch": branch, "cgpa": cgpa,
        "skills": user.get('skills', []) if user else [],
        "interests": user.get('interests', []) if user else [],
        "preferred_location": "remote"
    }

    try:
        search_res = execute_opportunities_search(
            query_str=f"{query} scholarship", user_profile=user_profile, page=1, limit=20
        )
        scholarships_data = search_res.get("results", [])
    except Exception:
        logger.exception('Scholarship discovery failed')
        return jsonify({'success': False, 'message': 'Scholarship search is temporarily unavailable.'}), 503

    log_activity(user_id, 'SCHOLARSHIP_AI_EXPLORE', f'AI explored scholarships: {query}')
    return jsonify({'success': True, 'scholarships': scholarships_data})


@app.route('/api/explore-internships', methods=['POST'])
@login_required
def api_explore_internships():
    """API endpoint to dynamically crawl internships."""
    data = request.get_json() or {}
    branch = data.get('branch', '')
    cgpa_val = data.get('cgpa', '')
    query = data.get('query', '')

    user_id = session['user_id']
    user = get_user_by_id(user_id)
    ai_engine = data.get('ai_engine') or _get_ai_engine(request, user)

    branch = branch or (user.get('branch') if user else '') or 'CSE'
    try:
        cgpa = float(cgpa_val) if cgpa_val else float((user.get('cgpa') if user else None) or 8.0)
    except (ValueError, TypeError):
        cgpa = 8.0

    user_profile = {
        "id": user_id, "branch": branch, "cgpa": cgpa,
        "skills": user.get('skills', []) if user else [],
        "interests": user.get('interests', []) if user else [],
        "preferred_location": "remote"
    }

    try:
        search_res = execute_opportunities_search(
            query_str=f"{query} internship", user_profile=user_profile, page=1, limit=20
        )
        internships_data = search_res.get("results", [])
    except Exception:
        logger.exception('Internship discovery failed')
        return jsonify({'success': False, 'message': 'Internship search is temporarily unavailable.'}), 503

    log_activity(user_id, 'INTERNSHIP_AI_EXPLORE', f'AI explored internships: {query}')
    return jsonify({'success': True, 'internships': internships_data})


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

        try:
            cgpa = float(cgpa_val) if cgpa_val else (user.get('cgpa') if user else None)
        except (ValueError, TypeError):
            cgpa = user.get('cgpa') if user else None

        branch = branch or (user.get('branch') if user else '') or 'CSE'

        if branch or cgpa:
            update_user_profile(user_id, branch, cgpa)
            user = get_user_by_id(user_id)

        user_profile = {
            "id": user_id, "branch": branch, "cgpa": cgpa or 8.0,
            "skills": [s.strip() for s in skills_str.split(",") if s.strip()] if skills_str else (user.get('skills', []) if user else []),
            "interests": [role] if role else (user.get('interests', []) if user else []),
            "preferred_location": "remote"
        }

        try:
            query = f"{role} {skills_str}".strip() or "engineering"
            search_res = execute_opportunities_search(
                query_str=query, user_profile=user_profile, page=1, limit=30
            )
            matched_opps = search_res.get("results", [])
        except Exception as e:
            logger.error('Error fetching live opportunities: %s', e)
            matched_opps = []

        formatted_matches = []
        for opp in matched_opps:
            formatted_matches.append({
                'id': opp.get('id'),
                'title': opp.get('title', ''),
                'company': opp.get('company', ''),
                'description': opp.get('description', ''),
                'match_percentage': opp.get('match_score', 0),
                'type': opp.get('type', 'Full-time'),
                'deadline': opp.get('deadline', 'N/A'),
                'link': opp.get('url', '#'),
                'source': opp.get('source', ''),
                'skills': opp.get('skills', []),
            })

        log_activity(user_id, 'OPPORTUNITY_AI_EXPLORE', f'AI searched opportunities: {role}')

        return jsonify({
            'success': True,
            'message': f'Found {len(formatted_matches)} matching opportunities',
            'matched_opportunities': formatted_matches
        })

    user_opportunities = get_user_opportunities(user_id)
    return render_template('opportunities.html', user=user, opportunities=user_opportunities)


# ==========================================
# PAGINATED SEARCH ENDPOINTS
# ==========================================

@app.route('/api/internships/search', methods=['GET'])
@login_required
def api_search_internships():
    q = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))

    user_id = session['user_id']
    user = get_user_by_id(user_id)
    user_profile = {
        "id": user_id,
        "branch": user.get('branch', 'CSE') if user else 'CSE',
        "cgpa": user.get('cgpa', 8.0) if user else 8.0,
        "skills": user.get('skills', []) if user else [],
        "interests": user.get('interests', []) if user else [],
        "preferred_location": "remote"
    }

    search_res = execute_opportunities_search(
        query_str=f"{q} internship".strip(), user_profile=user_profile, page=page, limit=limit
    )

    return jsonify({
        "results": search_res["results"], "page": search_res["page"],
        "limit": search_res["limit"], "total": search_res["total"],
        "has_next": search_res["has_next"]
    })


@app.route('/api/opportunities/search', methods=['GET'])
@login_required
def api_search_opportunities():
    q = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))

    user_id = session['user_id']
    user = get_user_by_id(user_id)
    user_profile = {
        "id": user_id,
        "branch": user.get('branch', 'CSE') if user else 'CSE',
        "cgpa": user.get('cgpa', 8.0) if user else 8.0,
        "skills": user.get('skills', []) if user else [],
        "interests": user.get('interests', []) if user else [],
        "preferred_location": "remote"
    }

    search_res = execute_opportunities_search(
        query_str=q, user_profile=user_profile, page=page, limit=limit
    )

    return jsonify({
        "results": search_res["results"], "page": search_res["page"],
        "limit": search_res["limit"], "total": search_res["total"],
        "has_next": search_res["has_next"]
    })


# ==========================================
# AI ANALYSIS APIs
# ==========================================

@app.route('/api/analyze-scholarship', methods=['POST'])
@login_required
def api_analyze_scholarship():
    data = request.get_json()
    scholarship_info = data.get('scholarship_info', '')
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    ai_engine = _get_ai_engine(request, user)

    if not scholarship_info:
        return jsonify({'success': False, 'message': 'Scholarship information required'})

    result = analyze_scholarship(
        scholarship_info,
        user.get('branch', 'Not specified') if user else 'Not specified',
        data.get('skills', ''),
        data.get('experience', ''),
        user.get('cgpa', 0) if user else 0,
        ai_engine=ai_engine
    )
    log_activity(user_id, 'SCHOLARSHIP_ANALYSIS', 'Analyzed scholarship')
    return jsonify(result)


@app.route('/api/analyze-internship', methods=['POST'])
@login_required
def api_analyze_internship():
    data = request.get_json()
    internship_info = data.get('internship_info', '')
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    ai_engine = _get_ai_engine(request, user)

    if not internship_info:
        return jsonify({'success': False, 'message': 'Internship information required'})

    result = analyze_internship(
        internship_info,
        user.get('branch', 'Not specified') if user else 'Not specified',
        data.get('skills', ''),
        data.get('experience', ''),
        user.get('cgpa', 0) if user else 0,
        ai_engine=ai_engine
    )
    log_activity(user_id, 'INTERNSHIP_ANALYSIS', 'Analyzed internship')
    return jsonify(result)


@app.route('/api/get-recommendations', methods=['POST'])
@login_required
def api_get_recommendations():
    data = request.get_json()
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    ai_engine = _get_ai_engine(request, user)

    opportunities_str = json.dumps(data.get('opportunities', []))
    result = recommend_opportunities(
        user.get('branch', 'Not specified') if user else 'Not specified',
        user.get('cgpa', 0) if user else 0,
        data.get('skills', ''),
        data.get('interests', ''),
        opportunities_str,
        ai_engine=ai_engine
    )
    log_activity(user_id, 'GET_RECOMMENDATIONS', 'Generated AI recommendations')
    return jsonify(result)


# ==========================================
# AI STATUS & SETTINGS  (Bug #6 fix — was using undefined user_repository module)
# ==========================================

@app.route('/api/ai-status', methods=['GET'])
@login_required
def api_ai_status():
    """Check AI service status. Never returns credentials."""
    gemini_ok = bool(os.getenv('GEMINI_API_KEY', '')) and os.getenv('GEMINI_API_KEY') != 'YOUR_API_KEY_HERE'
    openai_ok = bool(os.getenv('OPENAI_API_KEY', ''))
    return jsonify({
        'available': gemini_ok or openai_ok,
        'gemini': 'available' if gemini_ok else 'not_configured',
        'openai': 'available' if openai_ok else 'not_configured',
        'model': os.getenv('GEMINI_MODEL', 'gemini-1.5-flash'),
    })

@app.route('/api/settings/provider', methods=['POST'])
@login_required
def update_provider_settings():
    """Update user's preferred AI provider."""
    data = request.get_json() or {}
    engine = data.get('ai_engine')
    if engine not in ['gemini', 'openai']:
        return jsonify({'error': 'Invalid provider'}), 400

    update_user_profile(session['user_id'], ai_engine=engine)
    session['ai_engine'] = engine
    return jsonify({'success': True, 'engine': engine})


@app.route('/api/health/ai', methods=['GET'])
def api_health_ai():
    gemini_ok = bool(os.getenv('GEMINI_API_KEY', '')) and os.getenv('GEMINI_API_KEY') != 'YOUR_API_KEY_HERE'
    openai_ok = bool(os.getenv('OPENAI_API_KEY', ''))
    db_status = db_health_check()
    return jsonify({
        'gemini': 'available' if gemini_ok else 'not_configured',
        'openai': 'available' if openai_ok else 'not_configured',
        'database': db_status.get('status', 'unknown'),
    })


# ==========================================
# DYNAMIC UI ENDPOINTS
# ==========================================

@app.route('/api/study/task/complete', methods=['POST'])
@login_required
def api_study_task_complete():
    data = request.get_json() or {}
    task_id = data.get('task_id')
    session_id = data.get('session_id')
    user_id = session['user_id']

    if not task_id or not session_id:
        return jsonify({'success': False, 'message': 'Missing parameters'}), 400

    log_activity(user_id, 'STUDY_TASK_COMPLETE', f'Completed task {task_id}')
    return jsonify({'success': True, 'message': 'Task marked complete'})

@app.route('/api/opportunities/status', methods=['POST'])
@login_required
def api_opportunities_status():
    data = request.get_json() or {}
    opportunity_id = data.get('opportunity_id')
    status = data.get('status')
    user_id = session['user_id']

    if not opportunity_id or not status:
        return jsonify({'success': False, 'message': 'Missing parameters'}), 400

    try:
        save_user_opportunity(user_id, opportunity_id, status)
        log_activity(user_id, 'OPPORTUNITY_STATUS', f'Updated opportunity {opportunity_id} to {status}')
        return jsonify({'success': True, 'message': 'Status updated'})
    except Exception as e:
        logger.error(f"Error updating status: {e}")
        return jsonify({'success': False, 'message': 'Error updating status'}), 500

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
            data = request.get_json()
            code = data.get('code', '')
            language = data.get('language', 'python')
            ai_engine = data.get('ai_engine') or _get_ai_engine(request, user)
        else:
            code = request.form.get('code', '')
            language = request.form.get('language', 'python')
            ai_engine = request.form.get('ai_engine') or _get_ai_engine(request, user)

        if not code:
            return jsonify({'success': False, 'message': 'Please enter code to analyze'})

        try:
            analysis_result = analyze_code(language, code, ai_engine)

            if analysis_result.get('success'):
                explanation = analysis_result.get('summary', '')
                save_code_analysis(
                    user_id, code, language, explanation,
                    json.dumps(analysis_result.get('errors', [])),
                    json.dumps(analysis_result.get('suggestions', [])),
                    analysis_result.get('optimized_code', '')
                )
                log_activity(user_id, 'CODE_ANALYSIS', f'Analyzed {language} code ({len(code)} chars)')

            return jsonify({'success': analysis_result.get('success', False), 'analysis': analysis_result})
        except Exception as e:
            logger.error(f"Code analysis failed: {e}")
            return jsonify({
                'success': False,
                'message': 'Something prevented this request from completing. Please try again.',
                'analysis': {'success': False, 'message': str(e)}
            })

    history = get_code_analysis_history(user_id)
    api_status_info = {
        'available': is_api_available(),
        'model': os.getenv('GEMINI_MODEL', 'gemini-1.5-flash'),
    }
    return render_template('code-assistant.html', user=user, history=history, api_status=api_status_info)

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
            skills = data.get('skills', [])
            interests = data.get('interests', [])
            career_goals = data.get('career_goals', '')
            target_companies = data.get('target_companies', [])
            preferred_locations = data.get('preferred_locations', [])
        else:
            branch = request.form.get('branch', '')
            cgpa = request.form.get('cgpa', 0)
            skills = request.form.getlist('skills') or []
            interests = request.form.getlist('interests') or []
            career_goals = request.form.get('career_goals', '')
            target_companies = request.form.getlist('target_companies') or []
            preferred_locations = request.form.getlist('preferred_locations') or []

        try:
            cgpa = float(cgpa) if cgpa else None
        except Exception:
            cgpa = None

        update_user_profile(user_id, branch, cgpa,
                           skills=skills, interests=interests,
                           career_goals=career_goals,
                           target_companies=target_companies,
                           preferred_locations=preferred_locations)
        log_activity(user_id, 'PROFILE_UPDATE', 'Updated profile')
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

    if not verify_password(current_password, user['password'], user_id=user_id):
        return jsonify({'success': False, 'message': 'Incorrect current password'})

    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'New password must be at least 6 characters long'})

    update_password(user_id, hash_password(new_password))
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
# STUDY & CODE DETAIL ENDPOINTS
# ==========================================

@app.route('/study/<session_id>')
@login_required
def get_study_session_details(session_id):
    user_id = session['user_id']
    session_row = get_study_session(session_id, user_id)

    if not session_row:
        return jsonify({'success': False, 'message': 'Session not found'}), 404

    try:
        important_topics = json.loads(session_row.get('important_topics') or '[]')
    except Exception:
        important_topics = []
    try:
        priority_list = json.loads(session_row.get('study_priority') or '[]')
    except Exception:
        priority_list = []
    try:
        weekly_plan = json.loads(session_row.get('weekly_plan') or '[]')
    except Exception:
        weekly_plan = []

    return jsonify({
        'success': True,
        'session': {
            'id': session_row['id'],
            'title': session_row.get('title', ''),
            'created_at': str(session_row.get('created_at', '')),
            'important_topics': important_topics,
            'priority_list': priority_list,
            'weekly_plan': weekly_plan,
            'full_plan': session_row.get('charts_data') or ''
        }
    })


@app.route('/code-assistant/<analysis_id>')
@login_required
def get_code_analysis_details(analysis_id):
    user_id = session['user_id']
    analysis_row = get_code_analysis(analysis_id, user_id)

    if not analysis_row:
        return jsonify({'success': False, 'message': 'Analysis not found'}), 404

    try:
        errors = json.loads(analysis_row.get('errors') or '[]')
    except Exception:
        errors = []
    try:
        suggestions = json.loads(analysis_row.get('suggestions') or '[]')
    except Exception:
        suggestions = []

    return jsonify({
        'success': True,
        'analysis': {
            'id': analysis_row['id'],
            'language': analysis_row.get('language', ''),
            'code': analysis_row.get('code', ''),
            'explanation': analysis_row.get('explanation', ''),
            'errors': errors,
            'suggestions': suggestions,
            'optimized_code': analysis_row.get('optimized_code', ''),
            'created_at': str(analysis_row.get('created_at', ''))
        }
    })

# ==========================================
# ERROR HANDLERS
# ==========================================

def _wants_json():
    return (
        request.is_json
        or request.content_type == 'application/json'
        or request.headers.get('Accept', '').startswith('application/json')
        or request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    )

@app.errorhandler(404)
def not_found(error):
    if _wants_json():
        return jsonify({'success': False, 'message': 'The requested resource was not found.', 'error': '404'}), 404
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    logger.error('Internal server error: %s', error)
    if _wants_json():
        return jsonify({'success': False, 'message': 'An internal server error occurred. Please try again.', 'error': '500'}), 500
    return render_template('500.html'), 500

@app.errorhandler(Exception)
def handle_unhandled_exception(error):
    logger.exception('Unhandled exception: %s', error)
    if _wants_json():
        return jsonify({'success': False, 'message': 'Something prevented this request from completing. Please try again.', 'error': str(type(error).__name__)}), 500
    return render_template('500.html'), 500

# ==========================================
# MAIN
# ==========================================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
