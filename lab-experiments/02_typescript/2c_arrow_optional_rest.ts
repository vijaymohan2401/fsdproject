/**
 * Syllabus Experiment 2c:
 * Program to show the importance with Arrow functions using optional, default, and REST parameters.
 * FSD-2 Concept: ES6 Arrow Functions, Optional parameters (?), Default values (=), and REST parameters (...args)
 */

// 1. Arrow function with:
// - Default parameter: currency = 'INR'
// - Optional parameter: discountPercent?
const calculateInvoiceTotal = (
  baseAmount: number,
  currency: string = 'INR',
  discountPercent?: number
): string => {
  let finalAmount = baseAmount;
  if (discountPercent !== undefined) {
    finalAmount -= (baseAmount * discountPercent) / 100;
  }
  return `${currency} ${finalAmount.toFixed(2)}`;
};

// 2. Arrow function with REST parameters (...amounts: number[])
// Collects any number of expense arguments into a typed array
const calculateTotalExpenses = (...amounts: number[]): number => {
  return amounts.reduce((sum, current) => sum + current, 0);
};

// 3. Arrow function returning an object implicitly
const createTransaction = (category: string, amount: number, note: string = 'General') => ({
  category,
  amount,
  note,
  timestamp: new Date().toISOString()
});

console.log('--- Arrow Functions Demonstration ---');
console.log('1. Base with defaults: ', calculateInvoiceTotal(5000));
console.log('2. Base with discount: ', calculateInvoiceTotal(5000, 'USD', 10));
console.log('3. Rest parameters sum:', calculateTotalExpenses(2800, 1200, 450, 999, 1500));
console.log('4. Transaction Object: ', createTransaction('Food', 450, 'Canteen'));
