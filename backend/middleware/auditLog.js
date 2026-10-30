const auditLog = (action) => {
  return (req, res, next) => {
    if (req.user) {
      const logEntry = {
        action,
        timestamp: new Date(),
        userId: req.user._id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        method: req.method,
        path: req.path,
        status: res.statusCode,
      };

      // Log to console or database
      console.log('[Audit Log]', JSON.stringify(logEntry));

      // Add to request object for later use
      req.auditLog = logEntry;
    }

    next();
  };
};

module.exports = auditLog;
