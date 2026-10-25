/**
 * Syllabus Experiment 2f:
 * Program to understand generics with variables, functions, and constraints.
 * FSD-2 Concept: Type parameter <T>, Generic Functions, Generic Constraints (<T extends Identifiable>)
 */

// 1. Generic Constraint Interface
interface HasIdAndAmount {
  id: string | number;
  amount: number;
}

// 2. Generic Function with Constraint (<T extends HasIdAndAmount>)
// Guarantees that whatever type T is passed, it MUST possess 'id' and 'amount'
function calculateTotalSum<T extends HasIdAndAmount>(items: T[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

// 3. Generic Variable / Type Definition
type KeyValuePair<K, V> = {
  key: K;
  value: V;
};

const currencyPair: KeyValuePair<string, number> = {
  key: 'USD_TO_INR',
  value: 83.5,
};

// 4. Generic Queue / Collection Class
class GenericStorage<T> {
  private items: T[] = [];

  public add(item: T): void {
    this.items.push(item);
  }

  public getAll(): T[] {
    return this.items;
  }
}

// Concrete SpendWise data types satisfying the constraint
interface ExpenseItem extends HasIdAndAmount {
  category: string;
}

interface IncomeItem extends HasIdAndAmount {
  source: string;
}

const expenses: ExpenseItem[] = [
  { id: 1, category: 'Food', amount: 2800 },
  { id: 2, category: 'Transport', amount: 1200 },
];

const incomes: IncomeItem[] = [
  { id: 'inc_1', source: 'Stipend', amount: 15000 },
  { id: 'inc_2', source: 'Freelance', amount: 4500 },
];

console.log('Total Expenses Sum:', calculateTotalSum(expenses));
console.log('Total Incomes Sum: ', calculateTotalSum(incomes));
console.log('Generic Key-Value: ', currencyPair);
