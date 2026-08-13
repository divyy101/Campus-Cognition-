const loggerMiddleware = (req, res, next) => {
  req.requestId = `CC-${Math.floor(10000 + Math.random() * 90000)}`;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = loggerMiddleware;
