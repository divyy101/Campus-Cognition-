# 📚 Campus Cognition - AI-Powered Student Dashboard

Campus Cognition is a modern, production-ready academic dashboard equipped with advanced AI agents and secure systems to assist with exam preparation, code analysis, and scholarship/internship discovery.

---

## 🚀 Quick Start (5 Minutes)

### 1. Setup Environment
```bash
# Clone the repository and navigate to the directory
cd "Campus-Cognition"

# Setup virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key
SECRET_KEY=generate_a_secure_random_key
```

### 3. Run the Application
```bash
python app.py
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.
Use pre-configured demo credentials or register a new account:
- **Username:** `student1`
- **Password:** `password123`

---

## 🧠 Core Features & AI Agents

- 📚 **Study Agent**: Automates exam prep. Drag-and-drop syllabus & PYQ PDFs to instantly synthesize key study priorities, topic frequencies, and a customized weekly timetable using Google Gemini.
- 💻 **Code Assistant**: Paste code from any popular language (Python, C++, Java, etc.) to get automated explanations, performance optimization suggestions, bug detection, and refactored code templates.
- 🎓 **Career Matcher**: Intelligently parses local scholarship databases and skill-based internships to match students dynamically based on their branch and CGPA.
- 🛡️ **Cryptographically Secure Architecture**: Upgraded user database employing high-entropy salted password hashing (via Werkzeug security scrypt/PBKDF2 keys) to defend against brute-force/dictionary breaches, with zero-downtime hash migration for legacy users.
- 🔑 **Profile Rotation UI**: Dedicated password rotation system built into a premium glassmorphic interface card under the Security settings.

---

## 🛠️ Technology Stack

- **Backend**: Flask 3.0.0, Python 3.11, SQLite DB, Google Gemini AI (Generative AI SDK)
- **Frontend**: Responsive Glassmorphism Design, HTML5, CSS3 Variables, ES6 JavaScript, Bootstrap 5
- **Libraries**: PyPDF2 (PDF parsing), python-dotenv (environment configuration)

---

## 📁 Project Map

```text
campus-cognition/
├── app.py                     # Main Flask web server
├── config.py                  # Environment configurations
├── database/
│   ├── models.py              # SQLite models, secure hashing, and migration logic
│   └── campus_cognition.db    # Relational database file
├── services/
│   └── gemini_service.py     # Unified Google Gemini Generative API client
├── static/                    # Glassmorphism UI stylesheet, scripts, and imagery
├── templates/                 # Premium UI blueprints (Base, Dashboard, Agents, Auth)
└── requirements.txt           # Python library requirements
```

---

## 🛡️ Security Best Practices
- **Server-Side API Handling**: All Generative AI requests are proxy-routed through server-side environment variables (`.env`). No API keys are ever leaked to the client browser.
- **Salted Password Storage**: Built using PBKDF2/scrypt high-entropy salting mechanisms protecting user data against credentials leakage and data breaches.
