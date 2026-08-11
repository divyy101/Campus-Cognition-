# Campus Cognition V2 — Architecture

## System Overview
Campus Cognition V2 is a Flask-based AI educational platform that integrates document processing, RAG, and AI agent orchestration (Gemini + OpenAI) using MongoDB Atlas for all persistent state.

## Core Components
- **Flask Application (`app.py`)**: Central router and session manager.
- **AI Service (`services/ai_service.py`)**: Abstracted routing between `gemini_provider.py` and `openai_provider.py`.
- **Document Pipeline (`services/document_pipeline.py`)**: Asynchronous, non-blocking chunking, hashing, and analysis.
- **Repositories (`database/repositories/`)**: Isolated MongoDB CRUD operations.

## Deployment constraints
- Must be Vercel-compatible (stateless filesystem).
- Uses `/tmp` for upload processing before deletion.
- Background tasks run in thread executors locally, designed for easy porting to serverless functions.
