/**
 * Syllabus Experiment 1a:
 * Program to show the workflow of JavaScript code execution by creating a web server in Node.js.
 * FSD-2 Concept: Event Loop, Asynchronous Callbacks, and http.createServer()
 */

const http = require('http');

console.log('[Step 1: Synchronous] Initializing Node.js Web Server script...');

const PORT = 4001;

// Creating the HTTP Server
const server = http.createServer((req, res) => {
  // Callback executed on incoming request (Event-driven architecture)
  console.log(`[Step 3: Event Loop Trigger] Received request: ${req.method} ${req.url}`);

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Welcome to Node.js Web Server (FSD-2 Lab Experiment 1a)</h1>');
  res.write('<p>Demonstrating Node.js single-threaded event loop and HTTP request-response lifecycle.</p>');
  res.end();
});

// Server starts listening on specified port
server.listen(PORT, () => {
  console.log(`[Step 2: Server Listening] Node.js server is actively running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to terminate server.');
});
