/**
 * Syllabus Experiment 2b:
 * Program to understand function parameter and return types.
 * FSD-2 Concept: Parameter Type Annotations, Explicit Return Types, Void, and Type Signatures
 */

// 1. Function with explicit parameter types and return type
function calculateSimpleInterest(
  principal: number,
  ratePercent: number,
  timeInYears: number
): number {
  return (principal * ratePercent * timeInYears) / 100;
}

// 2. Function returning an object type
interface FinancialSummary {
  income: number;
  expenses: number;
  savings: number;
}

function generateSummary(income: number, expenses: number): FinancialSummary {
  return {
    income,
    expenses,
    savings: income - expenses,
  };
}

// 3. Function with multiple return possibilities using union
function formatCurrency(amount: number, currencySymbol?: string): string | null {
  if (amount < 0) return null;
  return `${currencySymbol || '₹'}${amount.toFixed(2)}`;
}

// Execution demonstration
const interest = calculateSimpleInterest(10000, 7.5, 2);
const report = generateSummary(20000, 12000);

console.log('Calculated Interest:', interest);
console.log('Financial Summary:', report);
console.log('Formatted Balance:', formatCurrency(report.savings));
