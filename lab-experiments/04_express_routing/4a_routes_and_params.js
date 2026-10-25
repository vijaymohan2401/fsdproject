/**
 * Syllabus Experiment 4a:
 * Program to define a route, Handling Routes, Route Parameters, Query Parameters, and URL building.
 * FSD-2 Concept: Express Router, req.params, req.query, and dynamic routing
 */

const express = require('express');
const app = express();
const PORT = 4004;

// Sample data
const categories = ['Food', 'Transportation', 'Education', 'Shopping'];

// 1. Basic Route Handling
app.get('/', (req, res) => {
  res.send('<h1>ExpressJS Routing Demonstration (Experiment 4a)</h1>');
});

// 2. Route Parameters (:categoryName)
// URL: /api/categories/Food
app.get('/api/categories/:categoryName', (req, res) => {
  const { categoryName } = req.params;
  const match = categories.find(c => c.toLowerCase() === categoryName.toLowerCase());

  if (!match) {
    return res.status(404).json({ error: `Category '${categoryName}' not found` });
  }

  res.json({
    routeParameterReceived: categoryName,
    matchedCategory: match,
    timestamp: new Date().toISOString()
  });
});

// 3. Query Parameters (?month=2026-10&limit=5)
// URL: /api/search?month=2026-10&limit=5
app.get('/api/search', (req, res) => {
  const { month, limit } = req.query;

  res.json({
    message: 'Query parameters processed successfully',
    queryParametersReceived: {
      month: month || 'All Months',
      limit: parseInt(limit, 10) || 10
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Experiment 4a] Express Routing Server running at http://localhost:${PORT}`);
  console.log(`  Test Route Param:  http://localhost:${PORT}/api/categories/Food`);
  console.log(`  Test Query Param:  http://localhost:${PORT}/api/search?month=2026-10&limit=5`);
});
