/**
 * Syllabus Experiment 1e:
 * User-Defined Module: Financial calculations helper
 * FSD-2 Concept: CommonJS Modularization (module.exports)
 */

function calculateNetBalance(income, expenses) {
  return income - expenses;
}

function calculateSavingsPercentage(income, expenses) {
  if (income <= 0) return 0;
  const savings = Math.max(0, income - expenses);
  return Math.round((savings / income) * 100);
}

function checkBudgetExceeded(actualExpense, budgetLimit) {
  return actualExpense > budgetLimit;
}

// Exporting functions as a modular object
module.exports = {
  calculateNetBalance,
  calculateSavingsPercentage,
  checkBudgetExceeded
};
