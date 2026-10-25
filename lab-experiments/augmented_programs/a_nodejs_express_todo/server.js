/**
 * Augmented Program (a):
 * Design a to-do list application using NodeJS and ExpressJS.
 * FSD-2 Concepts:
 * - Express HTTP server with static file serving
 * - RESTful API routes (GET, POST, PUT, DELETE)
 * - JSON body parsing middleware (express.json())
 * - In-memory and persistent resource CRUD manipulation
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Data Store for To-Do Items
let todos = [
  { id: 1, title: 'Complete Node.js Web Server Lab Report', completed: true, createdAt: new Date() },
  { id: 2, title: 'Practice TypeScript Generics and Interfaces', completed: false, createdAt: new Date() },
  { id: 3, title: 'Build Express REST API for Todo App', completed: true, createdAt: new Date() },
  { id: 4, title: 'Review MongoDB Aggregation Pipelines', completed: false, createdAt: new Date() },
];

// REST API Endpoints:

// 1. GET /api/todos — Retrieve all todos
app.get('/api/todos', (req, res) => {
  res.status(200).json({ success: true, count: todos.length, data: todos });
});

// 2. POST /api/todos — Create new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required.' });
  }

  const newTodo = {
    id: Date.now(),
    title: title.trim(),
    completed: false,
    createdAt: new Date(),
  };

  todos.unshift(newTodo);
  res.status(201).json({ success: true, message: 'Todo created successfully', data: newTodo });
});

// 3. PUT /api/todos/:id — Update / Toggle completed status
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ success: false, message: 'Todo not found.' });
  }

  if (typeof req.body.completed === 'boolean') {
    todo.completed = req.body.completed;
  }
  if (req.body.title) {
    todo.title = req.body.title.trim();
  }

  res.status(200).json({ success: true, message: 'Todo updated successfully', data: todo });
});

// 4. DELETE /api/todos/:id — Remove a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Todo not found.' });
  }

  res.status(200).json({ success: true, message: 'Todo deleted successfully' });
});

// Start the Express HTTP server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Augmented Program (a): Node.js & Express To-Do Server`);
  console.log(`   Running at: http://localhost:${PORT}`);
  console.log(`   REST API:   http://localhost:${PORT}/api/todos`);
  console.log(`=======================================================`);
});
