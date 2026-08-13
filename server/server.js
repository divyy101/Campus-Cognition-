const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const PORT = env.port || 5000;
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 Campus Cognition Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${env.nodeEnv}`);
    console.log(`🧠 AI Primary Provider: Campus AI (${env.campusAiModel})`);
    console.log(`⚡ AI Secondary Provider: Gemini (${env.geminiModel})`);
    console.log(`=================================================`);
  });
};

startServer();
