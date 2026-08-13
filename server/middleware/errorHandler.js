const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || `CC-${Math.floor(10000 + Math.random() * 90000)}`;
  console.error(`[Error ${requestId}] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorCode = err.code || err.error || 'SERVER_ERROR';

  res.status(statusCode).json({
    success: false,
    requestId: requestId,
    error: errorCode,
    message: err.message || 'An internal server error occurred. Please try again.'
  });
};

module.exports = errorHandler;
