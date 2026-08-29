const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    details: err.details || undefined,
  });
};

module.exports = { notFound, errorHandler };
