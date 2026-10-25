/**
 * Syllabus Experiment 7a:
 * Program to connect to MongoDB using Mongoose and perform CRUD operations.
 * FSD-2 Concept: Mongoose Connection, Schema, Model, create(), find(), findByIdAndUpdate(), findByIdAndDelete()
 */

const mongoose = require('mongoose');

// MONGODB Atlas URI or Local instance
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fsd2_lab_demo';

// 1. Define Mongoose Schema
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 1 },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

// 2. Compile Model
const Expense = mongoose.model('LabExpense', expenseSchema);

async function runMongooseCrudDemo() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB successfully!\n');

    // C - Create
    console.log('--- 1. CREATE ---');
    const newDoc = await Expense.create({
      title: 'College Lab Supplies',
      amount: 450,
      category: 'Education'
    });
    console.log('Inserted Document:', newDoc);

    // R - Read
    console.log('\n--- 2. READ (find) ---');
    const allDocs = await Expense.find();
    console.log(`Found ${allDocs.length} document(s).`);

    // U - Update
    console.log('\n--- 3. UPDATE ---');
    const updatedDoc = await Expense.findByIdAndUpdate(
      newDoc._id,
      { amount: 500 },
      { new: true }
    );
    console.log('Updated Document:', updatedDoc);

    // D - Delete
    console.log('\n--- 4. DELETE ---');
    const deletedDoc = await Expense.findByIdAndDelete(newDoc._id);
    console.log('Deleted Document:', deletedDoc);

  } catch (error) {
    console.warn('[MongoDB Notice]: Could not reach live MongoDB server.');
    console.warn(`Reason: ${error.message}`);
    console.warn('To test against MongoDB Atlas, set MONGODB_URI=mongodb+srv://... in your environment.');
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoose connection closed.');
  }
}

runMongooseCrudDemo();
