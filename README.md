# 📚 Campus Cognition - AI-Powered Student Dashboard

<div align="center">

![Version](https://img.shields.io/badge/version-3.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-green)
![Python](https://img.shields.io/badge/python-3.11-blue)
![Flask](https://img.shields.io/badge/flask-3.0.0-blue)
![AI](https://img.shields.io/badge/AI-Gemini%20API-orange)

**AI-Powered Academic Dashboard for Scholarships, Internships & Smart Study Planning**

[Quick Start](#-quick-start) • [AI Features](#-gemini-ai-integration) • [Setup](#-complete-setup) • [Troubleshooting](#-troubleshooting)

</div>

---

## 🌟 What is Campus Cognition?

Campus Cognition is a comprehensive AI-powered student dashboard that helps you discover scholarships, find internships, improve your code, and optimize your study strategy using **Google's Gemini AI**.

**Key Capabilities:**
- 🎓 **AI-Matched Scholarships** - Find scholarships tailored to your profile
- 💼 **Skill-Based Internships** - Discover internships matching your skills
- 📊 **Smart Study Plans** - Upload PDFs, get AI-generated study strategies
- 💻 **Code Analysis** - Get AI-powered code reviews and optimization tips
- 🤖 **Personalized Recommendations** - AI recommends best opportunities for YOU

---

## ✨ Features Overview

### 🤖 Gemini AI Integration
- **Study Material Analysis** - Upload syllabus & PYQs → AI generates study plan
- **Code Review & Debugging** - Paste code → Get detailed AI analysis and suggestions
- **Scholarship Matching** - AI analyzes your profile → Recommends scholarships
- **Internship Fit Analysis** - AI checks skill match → Provides preparation plan
- **Smart Recommendations** - AI ranks opportunities by compatibility

### 📚 Study Agent
- ✅ Drag-and-drop PDF upload (Syllabus & PYQs)
- ✅ Automatic text extraction with PyPDF2
- ✅ AI-powered study plan generation
- ✅ Key topics extraction
- ✅ Session history tracking
- ✅ Personalized study strategies

### 🎓 Scholarships Module
- ✅ Searchable scholarship database
- ✅ Filter by category, award amount, eligibility
- ✅ AI analyzes fit and match percentage
- ✅ Application tips and strategies
- ✅ Save/bookmark functionality
- ✅ Deadline tracking

### 💼 Internships Module
- ✅ Skill-based matching
- ✅ Filter by type (Summer, Winter, Remote, Permanent)
- ✅ Company information display
- ✅ Salary/stipend details
- ✅ Required skills highlighting
- ✅ AI fit analysis

### 💻 Code Assistant
- ✅ Multi-language support (Python, JavaScript, Java, C++, etc.)
- ✅ Code explanation with Gemini AI
- ✅ Error detection and bug finding
- ✅ Best practices and optimization tips
- ✅ Refactored code suggestions
- ✅ Analysis history

### 🎯 Opportunities Hub
- ✅ Unified view of all opportunities
- ✅ AI-powered recommendations
- ✅ Priority badges (Perfect/Great/Good Match)
- ✅ Dynamic filtering and sorting
- ✅ Save opportunities
- ✅ Track applications

### 👤 User Profile
- ✅ Edit branch and CGPA
- ✅ Track achievements
- ✅ View account statistics
- ✅ Security settings
- ✅ Activity log

---

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites
- Python 3.11+
- pip package manager

### 2. Installation

```bash
# Navigate to project
cd "Mini Project"

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key
# Edit .env and add: GEMINI_API_KEY=your_key_here
```

### 3. Get Your Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key
4. Paste into `.env` file: `GEMINI_API_KEY=your_key_here`

### 4. Run Application

```bash
python app.py
```

Open browser: **http://localhost:5000**

### 5. First Login

- Create new account OR use demo credentials
- Complete your profile (branch, CGPA)
- Start exploring!

---

## 🔑 Gemini AI Integration

### How It Works

All AI features are **server-side only** - your API key is never exposed to the frontend:

```
User Request → Flask Backend → Gemini Service → Gemini API → Response
```

### Environment Configuration

**`.env` File:**
```env
GEMINI_API_KEY=your-api-key-here
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

**How to Load:**
```python
from dotenv import load_dotenv
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
```

### AI Modules

#### 1. Study Analysis
**File:** `services/gemini_service.py` → `analyze_study_materials()`

```python
# Input: Syllabus & PYQ PDFs
# Output: Study plan, key topics, weekly schedule, practice tips
result = analyze_study_materials(syllabus_text, pyq_text)
```

**API Endpoint:**
```bash
POST /study
- Upload syllabus PDF
- Upload PYQ PDF
- Returns: Study plan + key topics
```

#### 2. Code Analysis
**File:** `services/gemini_service.py` → `analyze_code()`

```python
# Input: Code snippet + language
# Output: Explanation, errors, suggestions, optimized code
result = analyze_code(code, language)
```

**API Endpoint:**
```bash
POST /code-assistant
- Paste code
- Select language
- Returns: AI analysis + suggestions
```

#### 3. Scholarship Analysis
**File:** `services/gemini_service.py` → `analyze_scholarship()`

```python
# Input: Scholarship details + student profile
# Output: Eligibility, match score, application tips
result = analyze_scholarship(scholarship_info, branch, cgpa, achievements)
```

**API Endpoint:**
```bash
POST /api/analyze-scholarship
Content-Type: application/json

{
  "scholarship_info": "...",
  "achievements": "..."
}
```

#### 4. Internship Analysis
**File:** `services/gemini_service.py` → `analyze_internship()`

```python
# Input: Internship details + student profile
# Output: Fit analysis, skill gaps, preparation plan
result = analyze_internship(internship_info, branch, skills, experience, cgpa)
```

**API Endpoint:**
```bash
POST /api/analyze-internship
Content-Type: application/json

{
  "internship_info": "...",
  "skills": "..."
}
```

#### 5. Recommendations
**File:** `services/gemini_service.py` → `recommend_opportunities()`

```python
# Input: Student profile + opportunities list
# Output: Ranked recommendations with strategies
result = recommend_opportunities(branch, cgpa, skills, interests, opportunities)
```

**API Endpoint:**
```bash
POST /api/get-recommendations
Content-Type: application/json

{
  "skills": "Python, JavaScript",
  "interests": "...",
  "opportunities": [...]
}
```

### Prompt Templates

Located in `services/gemini_service.py`:

- `STUDY_ANALYSIS_PROMPT` - Study plan generation
- `CODE_ANALYSIS_PROMPT` - Code review template
- `OPPORTUNITY_MATCHING_PROMPT` - Recommendation template
- `SCHOLARSHIP_ANALYSIS_PROMPT` - Scholarship evaluation
- `INTERNSHIP_ANALYSIS_PROMPT` - Internship fit analysis

### Error Handling

All AI functions include graceful error handling:

```python
if not GEMINI_API_KEY:
    return {
        'success': False,
        'message': 'API key not configured'
    }

try:
    # AI call
except Exception as e:
    return {
        'success': False,
        'message': f'Error: {str(e)}'
    }
```

### API Status Check

Check if AI service is available:

```bash
GET /api/ai-status
Returns: {
  "available": true/false,
  "model": "gemini-1.5-flash",
  "api_key_set": true/false
}
```

---

## 📁 Project Structure

```
campus-cognition/
├── app.py                          # Main Flask application
├── .env                            # Environment variables (GITIGNORE)
├── requirements.txt                # Python dependencies
├── vercel.json                     # Vercel deployment config
│
├── services/
│   ├── __init__.py
│   └── gemini_service.py          # AI service module (all Gemini calls)
│
├── database/
│   ├── __init__.py
│   ├── models.py                   # Database schema
│   └── campus_cognition.db        # SQLite database
│
├── templates/
│   ├── base.html                   # Base template
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── study.html
│   ├── scholarships.html
│   ├── internships.html
│   ├── opportunities.html
│   ├── code-assistant.html
│   ├── profile.html
│   ├── activity.html
│   └── error_pages/
│
├── static/
│   ├── css/
│   │   └── main.css               # Styling
│   ├── js/
│   │   └── main.js                # JavaScript
│   └── uploads/                    # PDF storage
│
└── Documentation/
    └── README.md                   # This file
```

---

## 🔧 Complete Setup Guide

### Step 1: Environment Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

**Key Packages:**
- `Flask==3.0.0` - Web framework
- `Flask-Session==0.5.0` - Session management
- `google-generativeai==0.3.0` - Gemini API
- `PyPDF2==3.0.1` - PDF processing
- `python-dotenv==1.0.0` - Environment variables

### Step 3: Configure Gemini API

**Get API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy key

**Add to `.env`:**
```env
GEMINI_API_KEY=your_api_key_here
FLASK_ENV=production
SECRET_KEY=generate-random-string-here
PORT=5000
```

### Step 4: Initialize Database

Database initializes automatically on first run. Or manually:

```bash
python -c "from database.models import init_db; init_db()"
```

### Step 5: Run Application

```bash
python app.py
```

Access at: http://localhost:5000

---

## 📖 Usage Guide

### Creating an Account

1. Click "Sign Up"
2. Enter username, email, password
3. Create account
4. Login with credentials

### Using Study Agent

1. Go to **Study Agent**
2. Enter session title (e.g., "Database Systems")
3. Upload syllabus PDF (optional)
4. Upload PYQ PDF (required)
5. Click "Analyze Materials"
6. Get AI-powered study plan!

### Analyzing Code

1. Go to **Code Assistant**
2. Select programming language
3. Paste your code
4. Click "Analyze Code"
5. Get detailed AI feedback:
   - Code explanation
   - Errors found
   - Best practices
   - Optimized version

### Finding Scholarships

1. Go to **Scholarships**
2. Search or filter by category
3. Click scholarship card
4. Get AI analysis:
   - Eligibility check
   - Match percentage
   - Application tips
   - Success probability

### Discovering Internships

1. Go to **Internships**
2. Filter by type or skills
3. View company details
4. Get AI fit analysis:
   - Skill match
   - Preparation plan
   - Interview tips
   - Resume optimization

### Getting Recommendations

1. Complete your profile
2. Go to **Opportunities**
3. AI shows top matches
4. Each with:
   - Match score
   - Why it fits
   - Application strategy
   - Prep timeline

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'google.generativeai'"
**Solution:**
```bash
pip install google-generativeai
```

### Issue: "GEMINI_API_KEY not found"
**Solution:**
1. Create `.env` file in project root
2. Add: `GEMINI_API_KEY=your_key_here`
3. Ensure `.env` is in same folder as `app.py`

### Issue: "API key invalid"
**Solution:**
- Visit https://makersuite.google.com/app/apikey
- Create new key
- Copy full key (check no spaces)
- Update `.env`

### Issue: "Port 5000 already in use"
**Solution (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
python app.py
```

### Issue: "Database locked"
**Solution:**
- Close all app instances
- Delete `database/campus_cognition.db`
- Restart app (recreates DB)

### Issue: "PDF upload fails"
**Solution:**
- Check file is valid PDF
- Verify file < 50MB
- Ensure `static/uploads/` exists
- Check folder permissions

### Issue: "AI responses not showing"
**Solution:**
- Verify API key in `.env`
- Check internet connection
- Test API key at: https://makersuite.google.com/app/apikey
- Check rate limits haven't been exceeded

### Issue: "Localhost shows corrupted output"
**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+Shift+R`
3. Try different browser
4. Restart Flask server

---

## 🔐 Security Notes

✅ **API Key Security:**
- Never commit `.env` file (use `.gitignore`)
- API key only on backend, never in frontend
- Use environment variables in production
- Rotate keys periodically

✅ **File Upload Security:**
- Only PDF files allowed
- 50MB file size limit
- Secure filename generation
- Virus scanning recommended

✅ **Session Security:**
- Password hashing with SHA-256
- Session-based authentication
- Secure cookies
- CSRF protection ready

---

## 📊 Technology Stack

**Backend:**
- Flask 3.0.0
- Python 3.11
- SQLite database
- Google Gemini API

**Frontend:**
- HTML5 / CSS3
- JavaScript (ES6+)
- Bootstrap 5

**Libraries:**
- PyPDF2 - PDF processing
- google-generativeai - Gemini API
- python-dotenv - Environment management
- Flask-Session - Session handling

---

## 🚀 Deployment

### Vercel Deployment

**Step 1: GitHub Setup**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

**Step 2: Vercel Setup**
1. Visit https://vercel.com
2. Click "New Project"
3. Select GitHub repository
4. Click "Import"

**Step 3: Environment Variables**
1. Go to "Settings" → "Environment Variables"
2. Add: `GEMINI_API_KEY=your_key`
3. Add: `SECRET_KEY=random_string`
4. Click "Deploy"

**Step 4: Automatic Redeployment**
```bash
git push origin main  # Vercel redeploys automatically
```

---

## 🤝 Contributing

Want to improve Campus Cognition?

1. Fork repository
2. Create feature branch: `git checkout -b feature/xyz`
3. Make changes
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature/xyz`
6. Open Pull Request

---

## 📞 Support & Help

**Having Issues?**
1. Check [Troubleshooting](#-troubleshooting) section
2. Review error messages
3. Check `.env` configuration
4. Verify Gemini API key works

**Common Questions:**

**Q: Is my data private?**
A: Yes! All data stored locally in SQLite. No external storage.

**Q: How does AI work?**
A: All API calls server-side. Your API key never exposed.

**Q: Can I deploy to Vercel?**
A: Yes! Everything configured. Just add environment variables.

**Q: What if API goes down?**
A: Features work without AI with reduced functionality.

---

## 📄 License

MIT License - feel free to use and modify!

---

## 🎉 What's New in v3.0?

✨ **Major Updates:**
- Full Gemini AI integration with server-side only calls
- AI service module for reusable functions
- Environment variable support with .env
- New API endpoints for AI features
- Proper error handling and fallbacks
- Production-ready error handling
- Better prompt templates for each AI module

✨ **Improvements:**
- Cleaner code organization
- Better security (API key never exposed)
- Faster response times with caching
- More detailed AI analysis
- Beginner-friendly explanations

---

<div align="center">

**Made with ❤️ to help students succeed**

*Discover Opportunities. Master Your Skills. Achieve Your Dreams.*

[⬆ Back to Top](#-campus-cognition---ai-powered-student-dashboard)

</div>
