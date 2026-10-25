/**
 * Syllabus Experiment 1b:
 * Program to transfer data over HTTP Protocol using http module.
 * FSD-2 Concept: HTTP Request/Response Headers, Status Codes, JSON serialization, and chunk streaming
 */

const http = require('http');

const PORT = 4002;

// Sample financial transactions dataset to transfer
const transactions = [
  { id: 1, type: 'income', amount: 15000, category: 'Allowance' },
  { id: 2, type: 'expense', amount: 2800, category: 'Food' },
  { id: 3, type: 'expense', amount: 1200, category: 'Transportation' }
];

const server = http.createServer((req, res) => {
  // Set HTTP Response Headers for JSON data transfer
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && req.url === '/api/data') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      protocol: 'HTTP/1.1',
      totalRecords: transactions.length,
      data: transactions
    }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      status: 'error',
      message: 'Endpoint not found. Try GET /api/data'
    }));
  }
});

server.listen(PORT, () => {
  console.log(`[Experiment 1b] HTTP Data Transfer Server running at http://localhost:${PORT}/api/data`);
});
