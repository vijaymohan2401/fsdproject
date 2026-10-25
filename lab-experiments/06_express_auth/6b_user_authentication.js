/**
 * Syllabus Experiment 6b:
 * Program for user authentication using bcrypt password hashing and session authorization.
 * FSD-2 Concept: Cryptographic Hashing with Salt Rounds, Secure Authentication Lifecycle
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = 4010;

app.use(express.json());
app.use(session({
  secret: 'auth_lab_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 3600000 }
}));

// In-memory User Credentials Database
const users = [];

// 1. User Registration with Password Hashing
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Hash password using 10 salt rounds (FSD-2 core security topic)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User registered with secure hashed password!',
    userId: newUser.id,
    storedHash: hashedPassword
  });
});

// 2. User Login with Password Verification
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare plaintext password against stored hash using bcrypt.compare
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Bind authenticated user to session
  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({
    success: true,
    message: 'Authentication successful! Session created.',
    user: { id: user.id, username: user.username }
  });
});

// 3. Protected Dashboard Resource
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Access denied. Please login first.' });
  }

  res.json({
    message: `Welcome to the secure dashboard, ${req.session.username}!`,
    sessionUser: req.session.username
  });
});

app.listen(PORT, () => {
  console.log(`[Experiment 6b] User Authentication Server running at http://localhost:${PORT}`);
});
