/**
 * FSD-2 Module: TypeScript Interfaces and Object-Oriented Classes
 * Topic: Interfaces, Optional/Readonly properties, Classes, Access Modifiers, and Implements
 */

// 1. Interface with Optional and Readonly properties
export interface IAccount {
  readonly id: string; // Cannot be reassigned after initialization
  ownerName: string;
  email: string;
  phone?: string; // Optional property
  getBalance(): number;
}

// 2. Class Implementing Interface with Access Modifiers
export class BankAccount implements IAccount {
  readonly id: string;
  public ownerName: string;
  public email: string;
  public phone?: string;

  // Private property: Encapsulated, inaccessible outside BankAccount
  private _balance: number;

  // Protected property: Accessible only within this class and subclasses
  protected _transactionCount: number;

  constructor(id: string, ownerName: string, email: string, initialDeposit: number = 0) {
    this.id = id;
    this.ownerName = ownerName;
    this.email = email;
    this._balance = Math.max(0, initialDeposit);
    this._transactionCount = 0;
  }

  // Getter method
  public getBalance(): number {
    return this._balance;
  }

  // Business Methods
  public deposit(amount: number): boolean {
    if (amount <= 0) return false;
    this._balance += amount;
    this._transactionCount++;
    return true;
  }

  public withdraw(amount: number): boolean {
    if (amount <= 0 || amount > this._balance) return false;
    this._balance -= amount;
    this._transactionCount++;
    return true;
  }
}

// 3. Inheritance: Subclass extending Superclass
export class StudentAccount extends BankAccount {
  private _monthlyAllowanceLimit: number;

  constructor(
    id: string,
    ownerName: string,
    email: string,
    monthlyAllowanceLimit: number = 20000
  ) {
    super(id, ownerName, email, 0); // Call superclass constructor
    this._monthlyAllowanceLimit = monthlyAllowanceLimit;
  }

  public getAllowanceLimit(): number {
    return this._monthlyAllowanceLimit;
  }

  // Overriding / extending behavior
  public getSummary(): string {
    return `Student: ${this.ownerName} | Balance: ₹${this.getBalance()} | Tx Count: ${
      this._transactionCount
    }`;
  }
}

// Demonstration
const student = new StudentAccount('std_001', 'Rahul Sharma', 'rahul@spendwise.edu');
student.deposit(5000);
student.withdraw(1200);
console.log(student.getSummary());
