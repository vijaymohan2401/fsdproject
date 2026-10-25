/**
 * Syllabus Experiment 1e:
 * Workflow of Modularization of application using Node.js
 * FSD-2 Concept: Requiring user-defined module, code reuse, and encapsulation
 */

const {
  calculateNetBalance,
  calculateSavingsPercentage,
  checkBudgetExceeded
} = require('./financeCalculator');

console.log('=== Node.js Modularization Workflow (Experiment 1e) ===\n');

const monthlyIncome = 25000;
const monthlyExpenses = 14500;
const overallBudget = 15000;

const balance = calculateNetBalance(monthlyIncome, monthlyExpenses);
const savingsRate = calculateSavingsPercentage(monthlyIncome, monthlyExpenses);
const isExceeded = checkBudgetExceeded(monthlyExpenses, overallBudget);

console.log(`Monthly Income:    ₹${monthlyIncome}`);
console.log(`Monthly Expenses:  ₹${monthlyExpenses}`);
console.log(`Overall Budget:    ₹${overallBudget}`);
console.log('-----------------------------------');
console.log(`Available Balance: ₹${balance}`);
console.log(`Savings Rate:      ${savingsRate}%`);
console.log(`Budget Exceeded:   ${isExceeded ? 'YES (Warning!)' : 'NO (On Track)'}`);
