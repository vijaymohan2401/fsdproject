/**
 * Syllabus Experiment 14:
 * MongoDB Installation, ATLAS Configuration, and CRUD Query Reference
 * FSD-2 Concept: MongoDB Shell / Driver Commands: insert(), find(), update(), remove()
 */

/*
================================================================================
14a. MongoDB ATLAS CONFIGURATION INSTRUCTIONS:
================================================================================
1. Sign up / Log in to cloud.mongodb.com
2. Create a Free Shared Cluster (M0 Sandbox).
3. Under Security -> Database Access:
   - Create a database user (e.g., username: student, password: password123).
   - Role: Read and write to any database.
4. Under Security -> Network Access:
   - Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0).
5. Under Deployment -> Database -> Connect:
   - Choose "Drivers" (Node.js).
   - Copy connection string:
     mongodb+srv://student:<password>@cluster0.abcde.mongodb.net/spendwise?retryWrites=true&w=majority
================================================================================
*/

console.log('=== MongoDB CRUD Operations Query Guide (Experiment 14b) ===\n');

const mongoQueriesDemonstration = `
// 1. CREATE / INSERT
// Inserts a single transaction record into the 'transactions' collection
db.transactions.insertOne({
  type: "expense",
  amount: 2800,
  category: "Food",
  description: "College Canteen Meals",
  date: new Date("2026-10-15T12:00:00Z")
});

// Inserts multiple records in one atomic operation
db.transactions.insertMany([
  { type: "income", amount: 15000, category: "Pocket money or allowance", date: new Date() },
  { type: "expense", amount: 1200, category: "Transportation", date: new Date() }
]);

// 2. READ / FIND
// Find all transactions
db.transactions.find();

// Find with equality filter (all expense transactions)
db.transactions.find({ type: "expense" });

// Find with comparison query operators ($gt, $lte)
db.transactions.find({ amount: { $gt: 1000 } });

// 3. UPDATE
// Update a document matching criteria using $set operator
db.transactions.updateOne(
  { category: "Food" },
  { $set: { amount: 3000, note: "Updated for cafeteria rate revision" } }
);

// Update multiple documents matching criteria
db.transactions.updateMany(
  { type: "expense" },
  { $set: { verified: true } }
);

// 4. DELETE / REMOVE
// Delete a single document matching filter
db.transactions.deleteOne({ category: "Transportation" });

// Delete all documents matching filter
db.transactions.deleteMany({ amount: { $lt: 50 } });
`;

console.log(mongoQueriesDemonstration);
