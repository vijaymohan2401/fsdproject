/**
 * Syllabus Experiment 6a:
 * Program for session management using cookies and express-session.
 * FSD-2 Concept: Stateful HTTP, HttpOnly Session Cookies, Session ID tracking, and Page View Counters
 */

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 4009;

app.use(cookieParser());

// Configure Express Session Middleware
app.use(session({
  secret: 'fsd2_lab_session_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true, // Prevents client-side JavaScript access to cookie
    secure: false,  // Set true for HTTPS
  }
}));

// Route tracking session page views
app.get('/page-view', (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.json({
      message: 'Welcome back!',
      sessionId: req.sessionID,
      sessionViews: req.session.views,
      cookieDetails: req.session.cookie
    });
  } else {
    req.session.views = 1;
    res.json({
      message: 'Welcome! First session created.',
      sessionId: req.sessionID,
      sessionViews: 1
    });
  }
});

// Route destroying session
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Could not log out');
    res.clearCookie('connect.sid');
    res.send('Session destroyed and cookie cleared successfully.');
  });
});

app.listen(PORT, () => {
  console.log(`[Experiment 6a] Session Server running at http://localhost:${PORT}/page-view`);
});
