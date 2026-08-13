const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root or current directory
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || process.env.SECRET_KEY || 'campus-cognition-secret-key-2026',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_cognition',
  dbName: process.env.MONGODB_DB_NAME || 'campus_cognition',
  campusAiKey: process.env.CAMPUS_AI_API_KEY || '',
  campusAiEndpoint: process.env.CAMPUS_AI_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions',
  campusAiModel: process.env.CAMPUS_AI_MODEL || 'llama-3.3-70b-versatile',
  geminiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  openAiKey: process.env.OPENAI_API_KEY || '',
  mailHost: process.env.MAIL_HOST || 'smtp.gmail.com',
  mailPort: parseInt(process.env.MAIL_PORT || '587', 10),
  mailUsername: process.env.MAIL_USERNAME || '',
  mailPassword: process.env.MAIL_PASSWORD || '',
  mailFrom: process.env.MAIL_FROM || 'divyanshsingh74178@gmail.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
  maxUploadSize: parseInt(process.env.MAX_CONTENT_LENGTH || '734003200', 10)
};
