/**
 * FSD-2 Module: TypeScript Basics, Types, and Unions
 * Topic: Type Annotations, Type Inference, Enums, Tuples, Unions, and Intersections
 */

// 1. Primitive Type Annotations
const appName: string = 'SpendWise';
const appVersion: number = 2.0;
const isProduction: boolean = false;

// 2. Arrays & Tuples
// Array of numbers
const monthlyExpenses: number[] = [2800, 1200, 1500, 999];

// Tuple: Fixed length and known types in order [category, amount]
const topExpenseTuple: [string, number] = ['Food', 2800];

// 3. Enums (Numeric & String)
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

// 4. Union Types (Value can be one of several types)
type ID = string | number;
type BudgetStatus = 'normal' | 'warning' | 'exceeded';

const checkBudgetHealth = (percentage: number): BudgetStatus => {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 80) return 'warning';
  return 'normal';
};

// 5. Intersection Types (Combines multiple types into one)
type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type BaseEntity = {
  id: string;
};

type AuditedTransaction = BaseEntity & Timestamps & {
  amount: number;
  type: TransactionType;
};

const sampleRecord: AuditedTransaction = {
  id: 'tx_101',
  amount: 1500,
  type: TransactionType.EXPENSE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log(`[TypeScript Demo] Loaded ${appName} v${appVersion}`);
console.log(`[TypeScript Demo] Budget status for 85%: ${checkBudgetHealth(85)}`);
