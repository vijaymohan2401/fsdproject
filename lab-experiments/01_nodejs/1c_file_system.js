/**
 * Syllabus Experiment 1c:
 * Program to create a text file src.txt and add the syllabus content to it.
 * FSD-2 Concept: Node.js File System (fs) module, asynchronous file writing and reading
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src.txt');
const content = 'HTML, CSS, JavaScript, Typescript, MongoDB, ExpressJS, ReactJS, NodeJS';

// Asynchronous File Write
fs.writeFile(filePath, content, 'utf8', (err) => {
  if (err) {
    console.error('Error writing to src.txt:', err);
    return;
  }
  console.log(`[Success] File src.txt created successfully at: ${filePath}`);

  // Verification: Read back the file content
  fs.readFile(filePath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error('Error reading src.txt:', readErr);
      return;
    }
    console.log('[Verification] Content of src.txt:');
    console.log(`"${data}"`);
  });
});
