/**
 * Syllabus Experiment 15:
 * MongoDB Databases, Collections, Indexes, and Aggregation Pipeline
 * FSD-2 Concept: db.createCollection(), collection.drop(), createIndex(), sort(), limit(), aggregate()
 */

console.log('=== MongoDB Collections, Indexes & Aggregation (Experiment 15) ===\n');

const queriesDemo = `
// ==============================================================================
// 15a. CREATE AND DROP DATABASES AND COLLECTIONS
// ==============================================================================

// Switch to or create a new database
use spendwise_lab;

// Explicitly create a collection with validation rules or options
db.createCollection("budgets", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["month", "category", "amount"],
      properties: {
        month: { bsonType: "string" },
        category: { bsonType: "string" },
        amount: { bsonType: "number", minimum: 1 }
      }
    }
  }
});

// Show all collections in current database
show collections;

// Drop a specific collection
db.budgets.drop();

// Drop the entire current database
db.dropDatabase();


// ==============================================================================
// 15b. WORKING WITH RECORDS: find(), sort(), limit(), createIndex(), aggregate()
// ==============================================================================

// 1. Sort & Limit: Find top 3 highest expenses sorted in descending order
db.transactions.find({ type: "expense" })
  .sort({ amount: -1 })
  .limit(3);

// 2. Pagination: Skip first 10, limit 10
db.transactions.find()
  .sort({ date: -1 })
  .skip(10)
  .limit(10);

// 3. Creating Indexes for Query Optimization
// Single-field index on date
db.transactions.createIndex({ date: -1 });

// Compound unique index (prevents duplicate budget entries per month/category)
db.budgets.createIndex({ month: 1, category: 1 }, { unique: true });

// View all existing indexes
db.transactions.getIndexes();

// 4. Aggregation Pipeline: Calculate category-wise total spending
db.transactions.aggregate([
  // Stage 1: Filter only expense records
  {
    $match: {
      type: "expense",
      date: {
        $gte: ISODate("2026-10-01T00:00:00Z"),
        $lte: ISODate("2026-10-31T23:59:59Z")
      }
    }
  },
  // Stage 2: Group by category and sum amounts
  {
    $group: {
      _id: "$category",
      totalSpent: { $sum: "$amount" },
      transactionCount: { $sum: 1 }
    }
  },
  // Stage 3: Sort by totalSpent descending
  {
    $sort: { totalSpent: -1 }
  }
]);
`;

console.log(queriesDemo);
