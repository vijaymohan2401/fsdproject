/**
 * FSD-2 Module: Real-World SpendWise Domain Models in TypeScript
 * Topic: Application Type Architecture, Financial Contract Modeling
 */

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Pocket money or allowance'
  | 'Salary or stipend'
  | 'Freelance income'
  | 'Gifts'
  | 'Other income';

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Education'
  | 'Shopping'
  | 'Bills and utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Subscriptions'
  | 'Other expenses';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface ITransaction {
  _id: string;
  user: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudget {
  _id: string;
  user: string;
  month: string; // YYYY-MM
  category: 'Overall' | ExpenseCategory;
  amount: number;
  spent?: number;
  remaining?: number;
  percentage?: number;
  status?: 'normal' | 'warning' | 'exceeded';
}

export interface IDashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetLimit: number;
  budgetRemaining: number;
  budgetPercentage: number;
  budgetStatus: 'none' | 'normal' | 'warning' | 'exceeded';
}

export interface ICategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}
