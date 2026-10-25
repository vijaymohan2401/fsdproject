/**
 * Syllabus Experiment 5b:
 * Program to work with form data in Express.js.
 * FSD-2 Concept: Parsing URL-encoded form submissions (POST) using express.urlencoded()
 */

const express = require('express');
const app = express();
const PORT = 4008;

// Middleware to parse application/x-www-form-urlencoded data from standard HTML forms
app.use(express.urlencoded({ extended: true }));
// Middleware to parse application/json data from AJAX/Fetch API
app.use(express.json());

// In-memory submissions store
const registeredStudents = [];

// 1. Serve HTML Form
app.get('/form', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Form Data Processing (Experiment 5b)</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; background: #0f172a; color: #fff; }
        .form-card { max-width: 400px; margin: 0 auto; background: #1e293b; padding: 2rem; border-radius: 8px; }
        input, select { width: 100%; padding: 8px; margin: 8px 0 16px; box-sizing: border-box; border-radius: 4px; }
        button { background: #10b981; color: white; border: none; padding: 10px 16px; width: 100%; border-radius: 4px; font-weight: bold; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="form-card">
        <h2>Register Financial Profile</h2>
        <form method="POST" action="/submit-form">
          <label>Student Name:</label>
          <input type="text" name="studentName" placeholder="Enter full name" required />

          <label>Monthly Allowance (₹):</label>
          <input type="number" name="monthlyAllowance" placeholder="e.g. 15000" required />

          <label>Department:</label>
          <select name="department">
            <option value="CSE">Computer Science & Engineering</option>
            <option value="IT">Information Technology</option>
            <option value="ECE">Electronics & Communication</option>
          </select>

          <button type="submit">Submit Form Data</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// 2. Handle Form Data Submission (POST)
app.post('/submit-form', (req, res) => {
  const { studentName, monthlyAllowance, department } = req.body;

  console.log('[Form Submission Received]:', req.body);

  const newEntry = {
    id: registeredStudents.length + 1,
    studentName,
    monthlyAllowance: Number(monthlyAllowance),
    department,
    submittedAt: new Date().toISOString()
  };

  registeredStudents.push(newEntry);

  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h2 style="color: #059669;">Form Data Processed Successfully!</h2>
      <p>Received Name: <strong>${studentName}</strong></p>
      <p>Department: <strong>${department}</strong></p>
      <p>Allowance: <strong>₹${monthlyAllowance}</strong></p>
      <a href="/form" style="color: #0284c7;">Go Back to Form</a> | 
      <a href="/api/submissions" style="color: #0284c7;">View All Submissions (JSON)</a>
    </div>
  `);
});

app.get('/api/submissions', (req, res) => {
  res.json({ total: registeredStudents.length, submissions: registeredStudents });
});

app.listen(PORT, () => {
  console.log(`[Experiment 5b] Form Data Server running at http://localhost:${PORT}/form`);
});
