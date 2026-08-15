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
const documentRoutes = require('./routes/documentRoutes');

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
app.use('/api/documents', documentRoutes);

// Catch-all API route if no endpoint matched
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'API endpoint does not exist',
    path: req.originalUrl
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
