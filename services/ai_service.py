"""
AI Service Module — Campus Cognition V2
Central AI operations layer. All agents (Study, Code, Internship, Scholarship,
Opportunities) funnel through `get_ai_provider()` which returns the correct
backend (Gemini or OpenAI) based on the user's Neural Engine selection.
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional

from .providers.gemini_provider import GeminiProvider
from .providers.openai_provider import OpenAIProvider

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level config  (Bug #2 fix — these were previously undefined)
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')

# Singleton provider instances
_gemini = GeminiProvider()
_openai = OpenAIProvider()


def get_ai_provider(engine_name: str = 'gemini'):
    """Return the requested AI provider, falling back to the other if unavailable."""
    engine_name = (engine_name or 'gemini').lower()
    if engine_name == 'openai' and _openai.is_available():
        return _openai
    if _gemini.is_available():
        return _gemini
    if _openai.is_available():
        return _openai
    return None


# ---------------------------------------------------------------------------
# JSON cleaning utility
# ---------------------------------------------------------------------------

def clean_json_response(text: str) -> str:
    """Strip markdown fences and extract raw JSON from AI output."""
    text = text.strip()

    # Remove markdown code blocks
    if text.startswith("```"):
        first_newline = text.find("\n")
        if first_newline != -1:
            text = text[first_newline:].strip()
        else:
            text = text[3:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()

    # Extract content from first '{' or '[' to last matching bracket
    start_bracket = text.find('[')
    start_brace = text.find('{')

    if start_bracket != -1 and (start_brace == -1 or start_bracket < start_brace):
        start_idx = start_bracket
        end_idx = text.rfind(']')
    else:
        start_idx = start_brace
        end_idx = text.rfind('}')

    if start_idx != -1 and end_idx != -1:
        text = text[start_idx:end_idx + 1]

    # Strip trailing commas before closing braces/brackets
    text = re.sub(r',\s*\}', '}', text)
    text = re.sub(r',\s*\]', ']', text)

    return text


# ==========================================
# PROMPT TEMPLATES  (Bug #5 fix — single definition of each prompt)
# ==========================================

STUDY_ANALYSIS_PROMPT = """
You are a highly advanced cognitive educational AI agent. Your task is to analyze the syllabus and study materials for the subject "{subject_name}" under the learning scope "{scope}" and synthesize a deep educational plan in a strict JSON format.

**Subject Name:** {subject_name}
**Learning Scope/Focus:** {scope}
**Syllabus Content:**
{syllabus_text}

**Additional Notes / Study Material:**
{notes_text}

Return a valid JSON object ONLY. Do NOT wrap the JSON in ```json ``` markdown code blocks. The JSON must exactly match this schema:
Important: build coverage from the complete supplied syllabus. Do not provide shallow one-line labels. For each identifiable unit, chapter, and subtopic, include a useful 2–3 sentence explanation in `key_concepts`, including definitions, relationships, and the expected exam treatment. Keep the wording concrete and subject-specific.
{{
  "summary": "A detailed high-level summary of the subject and preparation strategy matching the scope",
  "key_concepts": ["Topic name — a 2–3 sentence explanation of the idea, what must be understood, and how it is examined", "...include EVERY identifiable syllabus topic or subtopic; do not limit this list to five items"],
  "formulas": ["formula 1 or core theorem 1", "formula 2 or core theorem 2", "formula 3 or core theorem 3"],
  "exam_tips": ["critical exam tip 1", "critical exam tip 2", "critical exam tip 3"],
  "difficulty_analysis": "An evaluation of the difficulty levels of different units",
  "prep_time_hours": 30,
  "repeated_topics": [
    {{"topic": "Topic A", "frequency": 5}},
    {{"topic": "Topic B", "frequency": 4}},
    {{"topic": "Topic C", "frequency": 3}},
    {{"topic": "Topic D", "frequency": 2}},
    {{"topic": "Topic E", "frequency": 2}}
  ],
  "important_questions": [
    "Unit 1: detailed high-weightage exam question or proof strategy",
    "Unit 2: detailed high-weightage exam question or proof strategy",
    "Unit 3: detailed high-weightage exam question or proof strategy",
    "Unit 4: detailed high-weightage exam question or proof strategy"
  ],
  "weekly_plan": [
    {{"day": "Monday [09:00 - 11:00 AM]", "duration_hours": 2, "topics": ["Topic 1", "Topic 2"]}},
    {{"day": "Wednesday [04:00 - 06:00 PM]", "duration_hours": 2, "topics": ["Topic 3", "Topic 4"]}},
    {{"day": "Friday [10:00 - 12:00 PM]", "duration_hours": 2, "topics": ["Topic 5", "Topic 6"]}},
    {{"day": "Saturday [02:00 - 04:00 PM]", "duration_hours": 2, "topics": ["Topic 7", "Topic 8"]}}
  ],
  "chart_metrics": {{
    "topic_frequency": {{
      "Topic A": 5,
      "Topic B": 4,
      "Topic C": 3,
      "Topic D": 2,
      "Topic E": 2
    }},
    "unit_importance": {{
      "Unit 1": 15,
      "Unit 2": 25,
      "Unit 3": 35,
      "Unit 4": 25
    }},
    "study_time_distribution": {{
      "Theoretical Study": 10,
      "Practical Work": 12,
      "Mock Exam Solving": 8
    }}
  }}
}}
"""

CODE_ANALYSIS_PROMPT = """
You are Verde CodeLab, an advanced AI static analysis engine.
Analyze the following {language} code and return your findings strictly in the following JSON format.
Do NOT wrap your response in ```json ``` blocks. Just output valid raw JSON.

{{
  "summary": "A 2-3 sentence overview of what this code does and its overall quality.",
  "errors": [
    {{"line": "Optional line number", "severity": "error|warning|info", "message": "Description of logical/syntax error"}}
  ],
  "time_complexity": "O(...)",
  "space_complexity": "O(...)",
  "complexity_explanation": "Briefly explain why this time/space complexity.",
  "suggestions": [
    "Suggestion 1 for optimization or edge cases",
    "Suggestion 2"
  ],
  "optimized_code": "The fully refactored and optimized code, ready to drop in."
}}

Code to analyze:
```{language}
{code}
```
"""

OPPORTUNITY_MATCHING_PROMPT = """
You are an opportunity recommendation expert. Given a student's profile, recommend scholarships and internships.

**Student Profile:**
- Branch: {branch}
- CGPA: {cgpa}
- Skills: {skills}
- Interests: {interests}

**Available Opportunities:**
{opportunities_list}

Provide your analysis as JSON:
{{
  "recommendations": [
    {{
      "title": "Opportunity title",
      "match_score": 85,
      "why_good_fit": "Explanation of why this matches",
      "preparation_tips": "How to prepare",
      "timeline": "When to apply"
    }}
  ],
  "overall_strategy": "High-level application strategy",
  "skill_gaps": ["Skills to develop"],
  "backup_options": ["Alternative opportunities"]
}}
"""

RAG_PROMPT = """
You are the Campus Cognition Study Assistant. Your task is to answer the student's question based strictly on the provided document excerpts.
If the provided context does not contain the answer, you must state that clearly and optionally supplement with general knowledge, but you MUST distinguish between what is in the text and what is general knowledge.
Always cite the source document section/topic where possible.

**Question:** {question}

**Relevant Document Context:**
{context}

Format your response in Markdown. Do not return JSON.
"""

SCHOLARSHIP_ANALYSIS_PROMPT = """
You are a scholarship expert AI. Analyze this scholarship and provide detailed guidance in JSON format.

**Scholarship Details:**
{scholarship_info}

**Student Profile:**
- Branch: {branch}
- CGPA: {cgpa}
- Skills: {skills}
- Experience: {experience}

Return valid JSON only:
{{
  "eligibility_check": "Can the student apply? Yes/No and why",
  "match_score": 85,
  "application_tips": ["tip 1", "tip 2", "tip 3"],
  "essay_guidance": "Key points to emphasize in application essay",
  "document_preparation": ["document 1", "document 2"],
  "deadline_strategy": "When and how to apply",
  "success_probability": "Realistic assessment with reasoning"
}}
"""

INTERNSHIP_ANALYSIS_PROMPT = """
You are a career coach AI. Analyze this internship opportunity for a student and return JSON.

**Internship Details:**
{internship_info}

**Student Profile:**
- Branch: {branch}
- Skills: {skills}
- Experience: {experience}
- CGPA: {cgpa}

Return valid JSON only:
{{
  "fit_analysis": "Is this internship right for the student?",
  "skill_match": ["matched skill 1", "matched skill 2"],
  "skill_gaps": ["gap 1", "gap 2"],
  "preparation_plan": "30-day preparation strategy",
  "interview_tips": ["tip 1", "tip 2", "tip 3"],
  "resume_optimization": "How to highlight relevant experience",
  "project_ideas": ["project 1", "project 2"]
}}
"""


# ==========================================
# CORE AI FUNCTIONS
# ==========================================

def analyze_code(language: str, code: str, ai_engine: str = 'gemini') -> dict:
    """Analyze code and return comprehensive structured feedback.

    Bug #1 fix — was importing get_ai_provider from base_provider (doesn't exist there).
    Now uses the module-level get_ai_provider defined above.
    """
    prompt = CODE_ANALYSIS_PROMPT.format(language=language, code=code)
    provider = get_ai_provider(ai_engine)

    if not provider:
        return {
            'success': False,
            'message': 'No AI provider is available. Please check API key configuration.',
            'model': 'none'
        }

    response_text = provider.generate_content(prompt, json_mode=True)
    if not response_text:
        return {
            'success': False,
            'message': f'{ai_engine.title()} could not process this request. Try switching Neural Engine.',
            'model': ai_engine
        }

    try:
        cleaned = clean_json_response(response_text)
        result = json.loads(cleaned)
        result['success'] = True
        result['model'] = ai_engine
        return validate_and_fill_code_data(result, code, language)
    except Exception as e:
        logger.error(f"Failed to parse code analysis JSON: {e}\nRaw: {response_text[:500]}")
        return {
            'success': False,
            'message': 'Failed to parse AI response. Please try again.',
            'model': ai_engine
        }


def analyze_study_materials(syllabus_text: str, notes_text: str = '',
                            subject_name: str = '', scope: str = 'Exam Focused',
                            ai_engine: str = 'gemini') -> Dict:
    """Analyze study materials and generate a personalized study plan.

    Bug #4 fix — removed dead code and undefined variable references.
    Now has clean fallback logic.
    """
    subject = subject_name if subject_name else "Core Subject"

    # Build fallback data based on extracted keywords
    fallback_data = _build_study_fallback(subject, scope, syllabus_text, notes_text)

    # Try AI provider
    prompt = STUDY_ANALYSIS_PROMPT.format(
        syllabus_text=syllabus_text[:12000],
        notes_text=(notes_text[:6000] if notes_text else "(No additional notes provided)"),
        subject_name=subject,
        scope=scope
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=True)
            if response_text:
                cleaned_text = clean_json_response(response_text)
                analysis = json.loads(cleaned_text)
                analysis['success'] = True
                analysis['model'] = getattr(provider, 'model_name', getattr(provider, 'model', 'ai-model'))
                analysis['timestamp'] = json.dumps({'generated': True})
                return validate_and_fill_study_data(analysis, subject, scope)
        except Exception as e:
            logger.error(f"Study AI analysis failed: {e}")

    # Fallback
    logger.warning("AI providers unavailable. Using intelligent fallback.")
    return fallback_data


def analyze_scholarship(scholarship_info: str, branch: str, skills: str,
                        experience: str, cgpa: float, ai_engine: str = 'gemini') -> dict:
    """Analyze scholarship based on profile using AI."""
    prompt = SCHOLARSHIP_ANALYSIS_PROMPT.format(
        scholarship_info=scholarship_info,
        branch=branch,
        skills=skills,
        experience=experience,
        cgpa=cgpa
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=True)
            if response_text:
                cleaned = clean_json_response(response_text)
                result = json.loads(cleaned)
                return {
                    'success': True,
                    'analysis': result,
                    'fit_score': result.get('match_score', 75),
                    'model': ai_engine
                }
        except Exception as e:
            logger.error(f"Scholarship analysis error: {e}")

    return {
        'success': True,
        'analysis': f"Based on your CGPA of {cgpa} and {branch} background, you appear to be a competitive candidate. Review eligibility requirements carefully.",
        'fit_score': 70,
        'model': 'local-fallback'
    }


def analyze_internship(internship_info: str, branch: str, skills: str,
                       experience: str, cgpa: float, ai_engine: str = 'gemini') -> Dict:
    """Analyze an internship based on student profile."""
    prompt = INTERNSHIP_ANALYSIS_PROMPT.format(
        internship_info=internship_info,
        branch=branch,
        skills=skills,
        experience=experience,
        cgpa=cgpa
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=False)
            if response_text:
                fit_score = extract_match_score(response_text)
                return {
                    'success': True,
                    'analysis': response_text,
                    'fit_score': fit_score,
                    'model': ai_engine
                }
        except Exception as e:
            logger.error(f"Internship analysis error: {e}")

    return {
        'success': False,
        'analysis': 'AI providers could not process this request. Please try again or switch Neural Engine.',
        'fit_score': 0,
        'model': 'none'
    }


def recommend_opportunities(branch: str, cgpa: float, skills: str,
                            interests: str, current_opportunities: str,
                            ai_engine: str = 'gemini') -> dict:
    """Recommend opportunities based on profile using AI."""
    prompt = OPPORTUNITY_MATCHING_PROMPT.format(
        branch=branch,
        cgpa=cgpa,
        skills=skills,
        interests=interests,
        opportunities_list=current_opportunities[:8000]
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=False)
            if response_text:
                return {
                    'success': True,
                    'recommendations': response_text,
                    'model': ai_engine
                }
        except Exception as e:
            logger.error(f"Recommendation error: {e}")

    return {
        'success': True,
        'recommendations': "1. Focus on Software Engineering roles matching your skills.\n2. Build open-source contributions to strengthen your resume.\n3. Apply to companies aligned with your target technologies.",
        'model': 'local-fallback'
    }


def answer_rag_question(question: str, context, ai_engine: str = 'gemini') -> str:
    """Answer a student's question based on provided RAG context."""
    if isinstance(context, list):
        context_text = "\n\n".join([
            f"**{c.get('section', 'Document Excerpt')}:**\n{c.get('content', '')}"
            for c in context
        ])
    else:
        context_text = str(context)

    prompt = RAG_PROMPT.format(question=question, context=context_text)

    provider = get_ai_provider(ai_engine)
    if provider:
        response_text = provider.generate_content(prompt, json_mode=False)
        if response_text:
            return response_text
    return "I'm sorry, I'm unable to process your question at the moment. Please try again."


# ==========================================
# HELPER / VALIDATION FUNCTIONS
# ==========================================

def validate_and_fill_study_data(data: Dict, subject: str, scope: str) -> Dict:
    """Ensure all required JSON keys are present in study analysis."""
    defaults = {
        'success': True,
        'summary': f"AI study blueprint for {subject} tailored to {scope} standards.",
        'key_concepts': [
            "Core foundational concepts",
            "Applied problem-solving strategies",
            "Theoretical proofs and derivations",
            "Practical implementation approaches",
            "Exam-specific strategies"
        ],
        'formulas': [
            "Key Formula 1",
            "Key Formula 2",
            "Key Formula 3"
        ],
        'exam_tips': [
            "Review high-frequency topics first",
            "Practice with previous year questions",
            "Focus on understanding rather than memorization"
        ],
        'difficulty_analysis': "Analysis of topic difficulty distribution across the syllabus.",
        'prep_time_hours': 30,
        'repeated_topics': [
            {"topic": "Core Topic A", "frequency": 5},
            {"topic": "Core Topic B", "frequency": 4},
            {"topic": "Core Topic C", "frequency": 3}
        ],
        'important_questions': [
            "Unit 1: Key exam question",
            "Unit 2: Key exam question",
            "Unit 3: Key exam question",
            "Unit 4: Key exam question"
        ],
        'weekly_plan': [
            {"day": "Monday [09:00 - 11:00 AM]", "duration_hours": 2, "topics": ["Topic 1", "Topic 2"]},
            {"day": "Wednesday [04:00 - 06:00 PM]", "duration_hours": 2, "topics": ["Topic 3", "Topic 4"]},
            {"day": "Friday [10:00 - 12:00 PM]", "duration_hours": 2, "topics": ["Topic 5", "Topic 6"]},
            {"day": "Saturday [02:00 - 04:00 PM]", "duration_hours": 2, "topics": ["Topic 7", "Topic 8"]}
        ],
        'chart_metrics': {
            "topic_frequency": {"Topic A": 5, "Topic B": 4, "Topic C": 3, "Topic D": 2, "Topic E": 2},
            "unit_importance": {"Unit 1": 20, "Unit 2": 25, "Unit 3": 30, "Unit 4": 25},
            "study_time_distribution": {"Theoretical Study": 10, "Practical Work": 12, "Mock Solving": 8}
        }
    }

    for key, val in defaults.items():
        if key not in data or data[key] is None:
            data[key] = val

    # Type normalization
    if not isinstance(data.get('key_concepts'), list):
        data['key_concepts'] = defaults['key_concepts']
    if not isinstance(data.get('formulas'), list):
        data['formulas'] = defaults['formulas']
    if not isinstance(data.get('exam_tips'), list):
        data['exam_tips'] = defaults['exam_tips']
    if not isinstance(data.get('repeated_topics'), list):
        data['repeated_topics'] = defaults['repeated_topics']
    if not isinstance(data.get('important_questions'), list):
        data['important_questions'] = defaults['important_questions']
    if not isinstance(data.get('weekly_plan'), list):
        data['weekly_plan'] = defaults['weekly_plan']
    if not isinstance(data.get('chart_metrics'), dict):
        data['chart_metrics'] = defaults['chart_metrics']

    return data


def validate_and_fill_code_data(data: Dict, code: str, language: str) -> Dict:
    """Ensure all required JSON keys are present in code analysis."""
    defaults = {
        'success': True,
        'summary': f"Static code analysis for {language}.",
        'errors': [],
        'time_complexity': "O(N)",
        'space_complexity': "O(1)",
        'complexity_explanation': "Linear scan of input data.",
        'optimized_code': code,
        'suggestions': ["Add comments and docstrings."]
    }

    for key, val in defaults.items():
        if key not in data or data[key] is None:
            data[key] = val

    if not isinstance(data.get('errors'), list):
        data['errors'] = [str(data['errors'])] if data.get('errors') else defaults['errors']
    if not isinstance(data.get('suggestions'), list):
        data['suggestions'] = [str(data['suggestions'])] if data.get('suggestions') else defaults['suggestions']

    return data


def _build_study_fallback(subject: str, scope: str, syllabus_text: str, notes_text: str) -> Dict:
    """Build intelligent fallback study data from keywords extracted from the texts."""
    text_combined = (syllabus_text + " " + notes_text + " " + subject).lower()
    ignored = {'syllabus', 'structure', 'question', 'questions', 'subject', 'university',
               'exam', 'exams', 'course', 'topic', 'topics', 'unit', 'units',
               'chapter', 'chapters', 'marks', 'weightage'}
    text_words = re.findall(r'\b[a-zA-Z]{5,}\b', text_combined)
    keywords = []
    for w in text_words:
        w_cap = w.capitalize()
        if w.lower() not in ignored and len(w) > 4 and w_cap not in keywords:
            keywords.append(w_cap)
    keywords = keywords[:12]
    while len(keywords) < 5:
        keywords.append("Core Concept")

    k1, k2, k3, k4, k5 = keywords[0], keywords[1], keywords[2], keywords[3], keywords[4]

    return {
        'success': True,
        'summary': f"AI academic blueprint for **{subject}** tailored to **{scope}** standards. "
                   f"Prioritizes {k1}, {k2}, and {k3} concepts.",
        'key_concepts': [
            f"Core foundations of {k1} systems",
            f"Dynamic optimization in {k2}",
            f"Algorithmic formulations in {k3}",
            f"Execution structures in {k4}",
            f"Integration guidelines for {k5}"
        ],
        'formulas': [
            f"{k1} Performance: P = Work / Time",
            f"{k2} Efficiency: E = Output / Capacity",
            f"{k3} Scaling: S = Complexity * N"
        ],
        'exam_tips': [
            f"State assumptions clearly before {k1} diagrams.",
            f"Verify constraints before {k2} steps.",
            f"Write step-by-step transitions for {k3} problems."
        ],
        'difficulty_analysis': f"{k2} optimizations and {k3} algorithms are high-weightage with steep learning curves.",
        'prep_time_hours': 30,
        'repeated_topics': [
            {"topic": f"{k1} Principles & Architecture", "frequency": 5},
            {"topic": f"{k2} Design & Optimization", "frequency": 4},
            {"topic": f"{k3} Implementation", "frequency": 3},
            {"topic": f"{k4} Analysis & Practices", "frequency": 3},
            {"topic": f"{k5} Integration Case Studies", "frequency": 2}
        ],
        'important_questions': [
            f"Unit 1: Explain theoretical foundations of {k1} matching {scope}.",
            f"Unit 2: Optimize {k2} parameters and trace state transitions.",
            f"Unit 3: Formulate implementation strategy for {k3}.",
            f"Unit 4: Compare {k4} vs {k5} with tradeoffs."
        ],
        'weekly_plan': [
            {"day": "Monday [09:00 - 11:00 AM]", "duration_hours": 2,
             "topics": [f"Core principles of {k1}", "Architectural constraints"]},
            {"day": "Wednesday [04:00 - 06:00 PM]", "duration_hours": 2,
             "topics": [f"Optimization for {k2}", "Design diagrams"]},
            {"day": "Friday [10:00 - 12:00 PM]", "duration_hours": 2,
             "topics": [f"Algorithms for {k3}", "State variables"]},
            {"day": "Saturday [02:00 - 04:00 PM]", "duration_hours": 2,
             "topics": [f"Validation for {k4}", f"{k5} integration"]}
        ],
        'chart_metrics': {
            "topic_frequency": {f"{k1}": 5, f"{k2}": 4, f"{k3}": 3, f"{k4}": 3, f"{k5}": 2},
            "unit_importance": {f"Unit 1 ({k1})": 25, f"Unit 2 ({k2})": 25,
                                f"Unit 3 ({k3})": 30, f"Unit 4 ({k4})": 20},
            "study_time_distribution": {"Theoretical Study": 10, "Analytical Work": 12, "Review": 8}
        },
        'model': 'local-fallback',
        'timestamp': json.dumps({'generated': False})
    }


def extract_match_score(text: str) -> int:
    """Extract match score from AI response text."""
    patterns = [
        r'(\d{1,3})%',
        r'score[:\s]*(\d{1,3})',
        r'match[:\s]*(\d{1,3})'
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            score = int(matches[0])
            return min(100, max(0, score))
    return 50


def is_api_available() -> bool:
    """Check if any AI provider is available."""
    return _gemini.is_available() or _openai.is_available()


def get_api_status() -> Dict:
    """Get current API status (no credentials returned)."""
    return {
        'available': is_api_available(),
        'gemini': 'available' if _gemini.is_available() else 'not_configured',
        'openai': 'available' if _openai.is_available() else 'not_configured',
        'model': GEMINI_MODEL,
    }


# ==========================================
# LIVE DISCOVERY AGENTS
# ==========================================

LIVE_SCHOLARSHIPS_PROMPT = """
You are a real-time academic crawlers AI agent. Generate a list of 6 highly realistic, current, and active scholarships matching this student profile:
- Branch: {branch}
- CGPA: {cgpa}
- Search Keywords: {query}

**CRITICAL**: Prioritize official government scholarship schemes (NSP India, INSPIRE, PMSS, AICTE Pragati/Saksham). Provide official portal links (.gov.in domains). Adjust matching scores based on search keywords.

For each scholarship, provide valid JSON array with objects containing: id, title, organization, award_amount, min_cgpa, deadline (YYYY-MM-DD in 2026), category (merit/need/special/research), description, link, match_percentage (0-100).
Return a valid JSON array ONLY. No markdown.
"""

LIVE_INTERNSHIPS_PROMPT = """
You are a real-time career crawlers AI agent. Generate a list of 6 highly realistic, current, and active internships matching:
- Branch: {branch}
- CGPA: {cgpa}
- Search Keywords: {query}

**CRITICAL**: Prioritize official government internship portals (AICTE, NITI Aayog, DRDO, ISRO) and premier companies. Provide official links. Adjust roles and scores based on search keywords.

For each internship, provide valid JSON array with objects containing: id, title, company, type (summer/winter/remote/permanent), duration, location, stipend, deadline (YYYY-MM-DD in 2026), required_skills, description, link, match_percentage (0-100).
Return a valid JSON array ONLY. No markdown.
"""

LIVE_OPPORTUNITIES_PROMPT = """
You are a real-time career matchmaker AI agent. Generate a list of 6 highly realistic, current, and active opportunities matching:
- Desired Role: {role}
- Branch: {branch}
- CGPA: {cgpa}
- Skills: {skills}

**CRITICAL**: Prioritize premier MNCs (Infosys, Amazon, TCS, Wipro, Google, Microsoft, Accenture, Cognizant, IBM, Nvidia). Provide official career links. Adjust based on search.

For each opportunity, provide valid JSON array with objects containing: id, title, company, type (Internship/Full-time/Scholarship), deadline (YYYY-MM-DD in 2026), required_skills, description, link, match_percentage (0-100).
Return a valid JSON array ONLY. No markdown.
"""


# ---------------------------------------------------------------------------
# Static fallback databases
# ---------------------------------------------------------------------------

DEFAULT_SCHOLARSHIPS = [
    {'id': 1, 'title': 'National Scholarship Portal (NSP) Post-Matric Scheme', 'organization': 'Ministry of Electronics & IT',
     'award_amount': '₹1,20,000', 'min_cgpa': 6.0, 'deadline': '2026-11-30', 'category': 'need',
     'description': 'Central government scholarship for undergraduate engineering courses.',
     'link': 'https://scholarships.gov.in/', 'match_percentage': 95},
    {'id': 2, 'title': 'DST INSPIRE Scholarship for Higher Education', 'organization': 'Department of Science & Technology',
     'award_amount': '₹80,000', 'min_cgpa': 8.0, 'deadline': '2026-10-15', 'category': 'merit',
     'description': 'Merit scholarship for engineering and basic sciences.',
     'link': 'https://online-inspire.gov.in/', 'match_percentage': 90},
    {'id': 3, 'title': 'AICTE Pragati Scholarship for Girl Students', 'organization': 'AICTE',
     'award_amount': '₹50,000', 'min_cgpa': 7.0, 'deadline': '2026-08-30', 'category': 'special',
     'description': 'Promoting technical education among girls in degree-level engineering.',
     'link': 'https://www.aicte-india.org/', 'match_percentage': 92},
]

DEFAULT_INTERNSHIPS = [
    {'id': 1, 'title': 'Software Engineering Intern', 'company': 'Google', 'type': 'summer',
     'duration': '3 months', 'location': 'Bangalore, India', 'stipend': '₹1,15,000/month',
     'deadline': '2026-08-30', 'required_skills': 'Python, Java, DSA',
     'description': 'Scale production backend architectures with MNC engineering teams.',
     'link': 'https://careers.google.com', 'match_percentage': 92},
    {'id': 2, 'title': 'AI Research Intern', 'company': 'Nvidia', 'type': 'summer',
     'duration': '6 months', 'location': 'Bangalore, India', 'stipend': '₹1,20,000/month',
     'deadline': '2026-09-30', 'required_skills': 'Python, PyTorch, C++, ML',
     'description': 'Optimize CUDA acceleration and train LLM models.',
     'link': 'https://careers.nvidia.com', 'match_percentage': 95},
    {'id': 3, 'title': 'AICTE Virtual Internship', 'company': 'AICTE', 'type': 'remote',
     'duration': '3 months', 'location': 'Remote', 'stipend': '₹10,000/month',
     'deadline': '2026-09-30', 'required_skills': 'Node.js, React, MongoDB',
     'description': 'Develop student portal features on the national AICTE register.',
     'link': 'https://internship.aicte-india.org', 'match_percentage': 92},
]


def get_default_scholarships() -> List[Dict]:
    return DEFAULT_SCHOLARSHIPS


def get_default_internships() -> List[Dict]:
    return DEFAULT_INTERNSHIPS


def _valid_discovery_results(results, kind: str) -> List[Dict]:
    """Validate AI output and remove duplicate listings."""
    if isinstance(results, dict):
        results = results.get(kind, results.get('results', []))
    if not isinstance(results, list):
        return []
    required = ('title', 'organization') if kind == 'scholarships' else ('title', 'company')
    unique, seen = [], set()
    for item in results:
        if not isinstance(item, dict) or not all(str(item.get(key, '')).strip() for key in required):
            continue
        identity = f"{item.get('title', '')}|{item.get(required[1], '')}".casefold().strip()
        if identity in seen:
            continue
        seen.add(identity)
        item = dict(item)
        item['id'] = item.get('id') or len(unique) + 1
        item['match_percentage'] = max(0, min(100, int(float(item.get('match_percentage', 0) or 0))))
        unique.append(item)
    return unique[:12]


def fetch_live_scholarships(branch: str = 'CSE', cgpa: float = 8.0,
                            query: str = '', ai_engine: str = 'gemini') -> List[Dict]:
    """Fetch live scholarships using AI agents with static fallback."""
    prompt = LIVE_SCHOLARSHIPS_PROMPT.format(
        branch=branch or 'CSE', cgpa=cgpa or 8.0,
        query=query or 'Latest official government scholarships'
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=True)
            if response_text:
                cleaned = clean_json_response(response_text)
                results = _valid_discovery_results(json.loads(cleaned), 'scholarships')
                if results:
                    return results
        except Exception as e:
            logger.error(f"Live scholarships error: {e}")

    # Filtered static fallback
    return _filter_static_results(DEFAULT_SCHOLARSHIPS, query, cgpa, 'scholarships')


def fetch_live_internships(branch: str = 'CSE', cgpa: float = 8.0,
                           query: str = '', ai_engine: str = 'gemini') -> List[Dict]:
    """Fetch live internships using AI agents with static fallback."""
    prompt = LIVE_INTERNSHIPS_PROMPT.format(
        branch=branch or 'CSE', cgpa=cgpa or 8.0,
        query=query or 'Latest official government internship programs'
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=True)
            if response_text:
                cleaned = clean_json_response(response_text)
                results = _valid_discovery_results(json.loads(cleaned), 'internships')
                if results:
                    return results
        except Exception as e:
            logger.error(f"Live internships error: {e}")

    return _filter_static_results(DEFAULT_INTERNSHIPS, query, cgpa, 'internships')


def fetch_live_opportunities(branch: str = 'CSE', cgpa: float = 8.0,
                             role: str = '', skills: str = '',
                             ai_engine: str = 'gemini') -> List[Dict]:
    """Fetch live opportunities using AI agents with static fallback."""
    prompt = LIVE_OPPORTUNITIES_PROMPT.format(
        branch=branch or 'CSE', cgpa=cgpa or 8.0,
        role=role or 'Software Engineer',
        skills=skills or 'Python, SQL, DSA'
    )

    provider = get_ai_provider(ai_engine)
    if provider:
        try:
            response_text = provider.generate_content(prompt, json_mode=True)
            if response_text:
                cleaned = clean_json_response(response_text)
                return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Live opportunities error: {e}")

    return _filter_static_results(DEFAULT_INTERNSHIPS, role or skills, cgpa, 'internships')


def _filter_static_results(db: List[Dict], query: str, cgpa: float, kind: str) -> List[Dict]:
    """Filter static fallback databases based on query text."""
    query_lower = (query or '').lower().strip()
    results = []

    if query_lower:
        for item in db:
            text = " ".join(str(v) for v in item.values()).lower()
            if any(word in text for word in query_lower.split() if len(word) > 2):
                results.append(dict(item))
    
    if not results:
        results = [dict(item) for item in db]

    # Adjust match percentages based on CGPA
    for item in results:
        base = item.get('min_cgpa', 6.0) if kind == 'scholarships' else 6.0
        cgpa_diff = max(0.0, (cgpa or 8.0) - base)
        item['match_percentage'] = min(100, int(80 + (cgpa_diff * 5)))

    return results[:10]
