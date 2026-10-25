/**
 * Syllabus Experiment 7b:
 * Program to develop a Single Page Application (SPA) using RESTful APIs.
 * FSD-2 Concept: Decoupled RESTful API Endpoints consumed by AJAX/Fetch in a Single Page Application
 */

const express = require('express');
const app = express();
const PORT = 4011;

app.use(express.json());

// In-Memory Database for SPA Items
let todos = [
  { id: 1, title: 'Learn React Hooks & Context', done: true },
  { id: 2, title: 'Build Express REST API with Mongoose', done: true },
  { id: 3, title: 'Ace FSD-2 College Lab Examination', done: false }
];

// RESTful API Endpoints
app.get('/api/todos', (req, res) => res.json(todos));

app.post('/api/todos', (req, res) => {
  const newTodo = { id: Date.now(), title: req.body.title, done: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.delete('/api/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id !== parseInt(req.params.id, 10));
  res.json({ success: true });
});

// Single Page Application Client HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SPA with RESTful API (Experiment 7b)</title>
      <style>
        body { font-family: sans-serif; background: #0f172a; color: white; padding: 2rem; }
        .spa-box { max-width: 500px; margin: 0 auto; background: #1e293b; padding: 2rem; border-radius: 8px; }
        input { padding: 8px; width: 70%; border-radius: 4px; border: 1px solid #475569; }
        button { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
        li { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="spa-box">
        <h2>Single Page App (SPA) Consumer</h2>
        <p>Interacting with RESTful endpoints via <code>fetch()</code> without reloading the page:</p>
        <div style="display:flex; gap: 8px; margin-bottom: 1rem;">
          <input id="newTodo" placeholder="New task..." />
          <button onclick="addTodo()">Add (POST)</button>
        </div>
        <ul id="todoList" style="list-style:none; padding:0;"></ul>
      </div>

      <script>
        async function fetchTodos() {
          const res = await fetch('/api/todos');
          const data = await res.json();
          const list = document.getElementById('todoList');
          list.innerHTML = data.map(t => \`
            <li>
              <span>\${t.title}</span>
              <button onclick="deleteTodo(\${t.id})" style="background:#ef4444; padding:2px 8px; font-size:12px;">Delete</button>
            </li>
          \`).join('');
        }

        async function addTodo() {
          const input = document.getElementById('newTodo');
          if(!input.value.trim()) return;
          await fetch('/api/todos', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ title: input.value })
          });
          input.value = '';
          fetchTodos(); // SPA DOM update without full page refresh
        }

        async function deleteTodo(id) {
          await fetch('/api/todos/' + id, { method: 'DELETE' });
          fetchTodos();
        }

        fetchTodos();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`[Experiment 7b] SPA REST API running at http://localhost:${PORT}`);
});
