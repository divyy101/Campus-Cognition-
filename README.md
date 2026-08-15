# 📚 Campus Cognition - AI-Powered Student Platform (MERN)

Campus Cognition is a modern, production-ready academic dashboard equipped with advanced AI agents and secure systems to assist with exam preparation, code analysis, and scholarship/internship discovery.

*Note: This project was recently migrated from Python/Flask to a full MERN Stack (MongoDB, Express, React, Node.js) for improved scalability and performance.*

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Clone the repository and navigate to the directory
git clone https://github.com/divyy101/Campus-Cognition-.git
cd "Campus Cognition"

# Install dependencies for both client and server
npm run setup
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
# Server configuration
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=generate_a_secure_random_key

# AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run the Application (Development Mode)
```bash
# Starts both the Express API server and the Vite React client concurrently
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or the port Vite outputs) in your browser.
Use pre-configured demo credentials or register a new account:
- **Email:** `test@example.com`
- **Password:** `password123`

---

## 🧠 Core Features & AI Agents

- 📚 **Study Agent**: Automates exam prep. Drag-and-drop syllabus & PYQ PDFs to instantly synthesize key study priorities, topic frequencies, and a customized weekly timetable using Google Gemini.
- 💻 **Code Assistant**: Paste code from any popular language (Python, C++, Java, etc.) to get automated explanations, performance optimization suggestions, bug detection, and refactored code templates.
- 🎓 **Opportunity & Scholarship Agents**: Intelligently parses local scholarship databases and skill-based internships to match students dynamically based on their branch and CGPA.
- 📊 **Activity Log & Dashboard**: Comprehensive student insights to track learning progress, saved opportunities, and platform engagement.

---

## 🎨 UI/UX Theme Redesign
Campus Cognition features a dynamic, state-of-the-art UI utilizing Semantic CSS Variables. Each AI Agent features its own custom aesthetic that gracefully responds to **Light and Dark Mode** toggles:
- **Code Lab:** Immersive Hacker Geeky Green Scan theme with pulsing terminals.
- **Study Agent:** Soft Amber & Coral palettes.
- **Opportunity Agent:** Crisp Emerald & Teal matching interfaces.
- **Scholarship Agent:** Premium Gold & Rose grants catalog.
- **Dashboard / Profile:** Atmospheric Aurora Blue, Pink & Lavender gradients.

---

## 🛠️ Technology Stack

- **Frontend (Client)**: React (Vite), Tailwind CSS (for layout utilities), Framer Motion, Lucide React, Axios. Custom CSS architectures instead of generic glassmorphism for enhanced text readability.
- **Backend (Server)**: Node.js, Express.js, MongoDB (Mongoose), Google Generative AI SDK (@google/generative-ai), JSON Web Tokens (JWT), bcryptjs for secure password hashing.

---

## 📁 Project Map

```text
campus-cognition/
├── frontend/                  # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/        # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── pages/             # Route-specific pages (CodeLab, StudyAgent, etc.)
│   │   ├── api/               # Axios configurations
│   │   └── context/           # React Context (Auth)
│   └── index.css              # Global semantic theme variables
├── backend/                   # Node.js/Express Backend Application
│   ├── src/
│   │   ├── controllers/       # Route logic (auth, AI, activity)
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routers
│   │   └── server.js          # Main Express entry point
│   ├── services/              # Gemini AI integrations & search services
│   └── data/                  # Seed data (companies, scholarships)
├── package.json               # Root scripts (concurrently runner)
└── .env                       # Environment configurations
```

---

## 🛡️ Security Best Practices
- **Server-Side API Handling**: All Generative AI requests are securely routed through the Node.js backend. No API keys are exposed to the React client.
- **Robust Authentication**: JWTs are used for secure session management alongside salted `bcrypt` password hashes to defend against credential breaches.
