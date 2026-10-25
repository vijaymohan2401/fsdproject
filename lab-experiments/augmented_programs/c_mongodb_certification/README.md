# Augmented Program (c): MongoDB Certification Preparation & Guide

This guide covers the requirements and study blueprint for completing the official certification from the **MongoDB University** website ([learn.mongodb.com](https://learn.mongodb.com/)).

---

## 🎓 Recommended Course: MongoDB Basics & Associate Developer Certification

- **Course**: Introduction to MongoDB (formerly M001: MongoDB Basics)
- **Certification Track**: MongoDB Associate Developer (Node.js Track)
- **Portal URL**: [https://learn.mongodb.com/](https://learn.mongodb.com/)
- **Cost**: Free learning paths, interactive hands-on labs, and quizzes.

---

## 📋 Key Syllabus Concepts Tested & Summary Notes

### 1. Documents and Collections
- MongoDB stores data in **BSON (Binary JSON)** format.
- Documents are organized in **Collections** inside a **Database**.
- Every document has a unique identifier field `_id` (usually an `ObjectId`).

### 2. MongoDB Atlas Configuration
1. Register at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create an **M0 Free Cluster**.
3. Create database user credentials under **Database Access**.
4. Configure IP whitelist (e.g., `0.0.0.0/0` for development) under **Network Access**.
5. Connect with URI string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/spendwise?retryWrites=true&w=majority
   ```

### 3. CRUD Query Syntax Cheat-Sheet

#### Insert Documents:
```javascript
// Insert single document
db.transactions.insertOne({
  type: "expense",
  category: "Food",
  amount: 250,
  date: new Date()
});

// Insert multiple documents
db.transactions.insertMany([
  { type: "income", amount: 15000, category: "Allowance" },
  { type: "expense", amount: 800, category: "Books" }
]);
```

#### Find / Query Documents:
```javascript
// Equality filter
db.transactions.find({ category: "Food" });

// Comparison operators ($gt, $gte, $lt, $lte, $in)
db.transactions.find({ amount: { $gte: 500, $lte: 2000 } });

// Logical operators ($and, $or)
db.transactions.find({
  $or: [
    { category: "Food" },
    { amount: { $gt: 5000 } }
  ]
});
```

#### Update Documents:
```javascript
// Update one document using $set operator
db.transactions.updateOne(
  { _id: ObjectId("64f1234567890abcdef12345") },
  { $set: { amount: 300, verified: true } }
);

// Update many matching documents
db.transactions.updateMany(
  { type: "expense" },
  { $set: { currency: "INR" } }
);
```

#### Delete Documents:
```javascript
// Delete single document
db.transactions.deleteOne({ _id: ObjectId("64f1234567890abcdef12345") });

// Delete many documents matching condition
db.transactions.deleteMany({ amount: { $lt: 50 } });
```

---

## ⚡ 4. Aggregation Framework Pipeline

MongoDB University tests understanding of the aggregation pipeline stages:

```javascript
db.transactions.aggregate([
  // Stage 1: $match (filters only expenses)
  { $match: { type: "expense" } },

  // Stage 2: $group (groups by category and sums totalSpent)
  {
    $group: {
      _id: "$category",
      totalSpent: { $sum: "$amount" },
      count: { $sum: 1 }
    }
  },

  // Stage 3: $sort (sorts categories by highest spending first)
  { $sort: { totalSpent: -1 } },

  // Stage 4: $limit (takes top 5 highest expense categories)
  { $limit: 5 }
]);
```

---

## 🔍 5. Indexes for Query Performance

```javascript
// Create index on date field for fast time-series queries
db.transactions.createIndex({ date: -1 });

// Create compound index for user-specific category lookups
db.transactions.createIndex({ userId: 1, category: 1 });

// Check index utilization using explain()
db.transactions.find({ userId: 101 }).explain("executionStats");
```

---

## 🏆 Checklist for Certification Viva Evaluation

- [x] Create free MongoDB Atlas cluster and record connection URI
- [x] Complete interactive quizzes on MongoDB University
- [x] Execute CRUD queries using `mongosh` or Node.js driver (`Mongoose`)
- [x] Demonstrate aggregation pipeline (`$match`, `$group`, `$sort`)
- [x] Download course completion certificate from student profile on [learn.mongodb.com](https://learn.mongodb.com)
