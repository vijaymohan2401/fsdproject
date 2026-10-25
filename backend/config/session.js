const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

/**
 * Configure cookie-based session management
 * FSD-2 Concept: Stateful session authentication, HttpOnly cookies, Session Store
 */
const configureSession = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGODB_URI;

  let store;

  // Only initialize MongoStore if an Atlas or valid remote URI is provided
  // or if mongoose is already connected, to avoid unhandled ECONNREFUSED crashes on local test environments.
  if (mongoUri && (mongoUri.startsWith('mongodb+srv://') || mongoose.connection.readyState === 1)) {
    try {
      store = MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native',
      });
      store.on('error', (err) => {
        console.warn('[MongoStore] Session store error:', err.message);
      });
    } catch (err) {
      console.warn('[Session] Falling back to memory session store:', err.message);
    }
  }

  return session({
    secret: process.env.SESSION_SECRET || 'spendwise_default_session_secret_key',
    resave: false,
    saveUninitialized: false,
    store: store, // If store is undefined, express-session automatically uses robust MemoryStore
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, // Prevents client-side XSS attacks from reading cookie
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    },
  });
};

module.exports = configureSession;
