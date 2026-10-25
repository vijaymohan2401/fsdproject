/**
 * Syllabus Experiment 1d:
 * Program to parse an URL using URL module.
 * FSD-2 Concept: Node.js URL Module, Protocol, Host, Port, Pathname, Query Parameters (Search params)
 */

const { URL } = require('url');

// Sample SpendWise REST API URL with query parameters
const testUrlString = 'http://localhost:5000/api/transactions?month=2026-10&category=Food&limit=10#summary';

console.log('=== Node.js URL Module Parser ===\n');
console.log('Original URL String:', testUrlString);

// Parsing using standard URL WHATWG API
const parsedUrl = new URL(testUrlString);

console.log('\n--- Parsed URL Components ---');
console.log('1. Protocol:    ', parsedUrl.protocol);
console.log('2. Hostname:    ', parsedUrl.hostname);
console.log('3. Port:        ', parsedUrl.port);
console.log('4. Host:        ', parsedUrl.host);
console.log('5. Pathname:    ', parsedUrl.pathname);
console.log('6. Hash/Fragment:', parsedUrl.hash);
console.log('7. Search/Query:', parsedUrl.search);

console.log('\n--- Query Parameters Extraction (URLSearchParams) ---');
parsedUrl.searchParams.forEach((value, key) => {
  console.log(`  Key: "${key}" => Value: "${value}"`);
});

// Demonstrating URL Building / Manipulation
parsedUrl.searchParams.set('type', 'expense');
parsedUrl.searchParams.delete('limit');

console.log('\n--- Modified URL (URL Building) ---');
console.log(parsedUrl.toString());
