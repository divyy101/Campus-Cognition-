const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studyRoutes = require('./routes/studyRoutes');
const codeRoutes = require('./routes/codeRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const healthRoutes = require('./routes/healthRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Security and Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts / styles in SPA
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(loggerMiddleware);

// Serve uploaded static files
app.use('/static/uploads', express.static(path.resolve(__dirname, '../../static/uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/activity', activityRoutes);

// Catch-all route for frontend static build in production
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
console.log(`[Express App] Checking frontend build path: ${clientBuildPath} (exists: ${require('fs').existsSync(clientBuildPath)})`);
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Campus Cognition Node.js Express API Server V2',
      status: 'online',
      docs: '/api/health'
    });
  });
}

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
