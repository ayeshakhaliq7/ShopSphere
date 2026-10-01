exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  if (err.name === 'CastError') { status = 400; message = 'Invalid identifier supplied.'; }
  if (err.code === 11000) {
    status = 409;
    message = `That ${Object.keys(err.keyPattern || { value: 1 })[0]} is already in use.`;
  }
  if (err.name === 'ValidationError') {
    status = 422;
    message = Object.values(err.errors).map((e) => e.message)[0];
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error.';
  }
  res.status(status).json({ message });
};
