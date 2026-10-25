/**
 * Syllabus Experiment 2e:
 * Program to understand the working of namespaces and modules in TypeScript.
 * FSD-2 Concept: namespace scoping, export within namespace, and ES6 module exports/imports
 */

// 1. Working of Namespaces (Internal modularization in TypeScript)
namespace FinancialValidation {
  // Private to the namespace (not exported)
  const MIN_TRANSACTION_AMOUNT = 1;

  // Exported: Accessible outside namespace via FinancialValidation.isValidAmount
  export function isValidAmount(val: number): boolean {
    return typeof val === 'number' && Number.isFinite(val) && val >= MIN_TRANSACTION_AMOUNT;
  }

  export function isValidCategory(cat: string): boolean {
    return typeof cat === 'string' && cat.trim().length > 0;
  }

  // Nested namespace
  export namespace CurrencyCodes {
    export const DEFAULT_CURRENCY = 'INR';
    export const ALLOWED = ['INR', 'USD', 'EUR', 'GBP'];
  }
}

// 2. Working of Modules (External ES6 / CommonJS modularization)
export interface TransactionRecord {
  id: string;
  category: string;
  amount: number;
}

export class TransactionService {
  private records: TransactionRecord[] = [];

  public add(record: TransactionRecord): boolean {
    if (FinancialValidation.isValidAmount(record.amount)) {
      this.records.push(record);
      return true;
    }
    return false;
  }

  public getAll(): TransactionRecord[] {
    return [...this.records];
  }
}

// Demonstration
console.log('--- TypeScript Namespaces & Modules ---');
console.log('Valid Amount (1500):', FinancialValidation.isValidAmount(1500));
console.log('Valid Amount (-50): ', FinancialValidation.isValidAmount(-50));
console.log('Default Currency:   ', FinancialValidation.CurrencyCodes.DEFAULT_CURRENCY);

const service = new TransactionService();
service.add({ id: '1', category: 'Books', amount: 850 });
console.log('Stored Records:     ', service.getAll());
