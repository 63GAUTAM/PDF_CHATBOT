const endpointLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`[${logLevel}] ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });

  next();
};

module.exports = endpointLogger;
