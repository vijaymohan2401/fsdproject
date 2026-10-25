/**
 * FSD-2 Module: Async Promises, User-Defined Type Guards, and Exhaustive Type Checking
 * Topic: Type Narrowing, Custom Type Guards (`arg is Type`), Promises, and Never type
 */

import { ITransaction, TransactionType } from './04_spendwise_domain_models';

// 1. User-Defined Type Guard
// Narrowing unknown/general transaction to an Expense
export function isExpense(transaction: ITransaction): boolean {
  return transaction.type === 'expense';
}

export function isIncome(transaction: ITransaction): boolean {
  return transaction.type === 'income';
}

// 2. Type Guard with 'arg is Type' signature
interface CashTransaction extends ITransaction {
  paymentMethod: 'CASH';
}

interface DigitalTransaction extends ITransaction {
  paymentMethod: 'UPI' | 'NET_BANKING' | 'CARD';
  referenceId: string;
}

type PaymentRecord = CashTransaction | DigitalTransaction;

export function isDigitalPayment(tx: PaymentRecord): tx is DigitalTransaction {
  return (tx as DigitalTransaction).referenceId !== undefined;
}

// 3. Exhaustive Type Checking using 'never' type
export function formatTransactionBadge(type: TransactionType): string {
  switch (type) {
    case 'income':
      return '[+] Income Received';
    case 'expense':
      return '[-] Expense Deducted';
    default:
      // If a new type is added to TransactionType, TypeScript will produce a compile error here
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
}

// 4. Async API typing with Promise<T>
export async function calculateAvailableBalance(
  fetchTransactions: () => Promise<ITransaction[]>
): Promise<{ income: number; expense: number; balance: number }> {
  const transactions = await fetchTransactions();

  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (isIncome(tx)) {
      income += tx.amount;
    } else if (isExpense(tx)) {
      expense += tx.amount;
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
  };
}

console.log('[TypeScript Type Guards] Loaded type guards and async examples.');
