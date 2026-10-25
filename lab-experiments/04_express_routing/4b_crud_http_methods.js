/**
 * Syllabus Experiment 4b:
 * Program to accept data (POST), retrieve data (GET), and delete a resource (DELETE) using HTTP methods.
 * FSD-2 Concept: RESTful HTTP Methods, Status Codes (200, 201, 204, 404), JSON Body Parsing
 */

const express = require('express');
const app = express();
const PORT = 4005;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// In-memory resource store
let items = [
  { id: 1, name: 'Reference Textbooks', price: 1500 },
  { id: 2, name: 'Bus Pass', price: 800 }
];

// 1. GET: Retrieve all data
app.get('/api/items', (req, res) => {
  res.status(200).json({ success: true, count: items.length, data: items });
});

// 2. GET: Retrieve specific resource by ID
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id, 10));
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.status(200).json({ success: true, data: item });
});

// 3. POST: Accept new data
app.post('/api/items', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  const newItem = {
    id: items.length > 0 ? items[items.length - 1].id + 1 : 1,
    name,
    price: Number(price)
  };

  items.push(newItem);
  res.status(201).json({ success: true, message: 'Resource created', data: newItem });
});

// 4. DELETE: Delete a specified resource
app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found to delete' });
  }

  const deleted = items.splice(index, 1)[0];
  res.status(200).json({ success: true, message: 'Resource deleted', deletedItem: deleted });
});

app.listen(PORT, () => {
  console.log(`[Experiment 4b] CRUD HTTP Methods server running at http://localhost:${PORT}/api/items`);
});
