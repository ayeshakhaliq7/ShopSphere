require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set it.');
  if (!process.env.VERCEL) process.exit(1);
}

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

if (process.env.VERCEL) {
  let cached = global._mongooseConn;
  if (!cached) cached = global._mongooseConn = { conn: null, promise: null };
  app.use(async (_req, res, next) => {
    try {
      if (!cached.conn) {
        if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
        cached.conn = await cached.promise;
      }
      next();
    } catch (err) {
      res.status(500).json({ message: 'Database connection failed.' });
    }
  });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

app.use(notFound);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`ShopSphere API running on http://localhost:${PORT}`)))
    .catch((err) => {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    });
}

module.exports = app;
