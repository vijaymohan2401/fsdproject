/**
 * Syllabus Experiment 2d:
 * Program to understand TypeScript classes, constructors, properties, methods, and access specifiers.
 * FSD-2 Concept: Encapsulation with public, private, protected, readonly, and inheritance (extends)
 */

class BankCustomer {
  // Readonly property: Cannot be modified once set in constructor
  readonly accountId: string;

  // Public: Accessible anywhere
  public fullName: string;

  // Private: Accessible ONLY within BankCustomer class
  private _balance: number;

  // Protected: Accessible within BankCustomer and any subclass
  protected _isActive: boolean;

  constructor(accountId: string, fullName: string, initialBalance: number = 0) {
    this.accountId = accountId;
    this.fullName = fullName;
    this._balance = Math.max(0, initialBalance);
    this._isActive = true;
  }

  // Getter method
  public getBalance(): number {
    return this._balance;
  }

  // Public Method
  public deposit(amount: number): void {
    if (amount <= 0) throw new Error('Deposit must be positive');
    this._balance += amount;
    console.log(`[Deposit] ₹${amount} deposited. New balance: ₹${this._balance}`);
  }

  public withdraw(amount: number): boolean {
    if (amount > this._balance) {
      console.log(`[Withdraw Failed] Insufficient balance for ₹${amount}`);
      return false;
    }
    this._balance -= amount;
    console.log(`[Withdraw Success] ₹${amount} withdrawn. Remaining: ₹${this._balance}`);
    return true;
  }
}

// Subclass demonstrating 'protected' access
class PremiumCustomer extends BankCustomer {
  public creditLimit: number;

  constructor(accountId: string, fullName: string, initialBalance: number, creditLimit: number) {
    super(accountId, fullName, initialBalance);
    this.creditLimit = creditLimit;
  }

  public checkAccountStatus(): void {
    // Can access protected _isActive from parent class
    console.log(`Premium Account ${this.accountId} Active: ${this._isActive}`);
  }
}

const customer = new PremiumCustomer('ACC_8892', 'Priya Rao', 15000, 50000);
customer.deposit(3000);
customer.withdraw(5000);
customer.checkAccountStatus();
