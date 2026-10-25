/**
 * FSD-2 Module: Generics and Utility Types
 * Topic: Generic Functions, Generic Interfaces, and Standard Utility Types (Partial, Pick, Omit, Record)
 */

// 1. Generic Function: Operates on any type T while maintaining type safety
export function getFirstItem<T>(items: T[]): T | undefined {
  return items.length > 0 ? items[0] : undefined;
}

// 2. Generic Interface: Standard API Response Envelope
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

// 3. Concrete Domain Model for Demonstrating Utilities
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredCurrency: 'INR' | 'USD' | 'EUR';
  isVerified: boolean;
}

// 4. Built-in Utility Types:
// A. Partial<T>: Makes all properties optional (ideal for PUT / PATCH updates)
export type UpdateProfilePayload = Partial<UserProfile>;

const partialUpdate: UpdateProfilePayload = {
  name: 'Updated Name',
};

// B. Pick<T, Keys>: Selects a subset of properties from T
export type PublicUserBadge = Pick<UserProfile, 'name' | 'email'>;

// C. Omit<T, Keys>: Omits specific properties (e.g. omit sensitive or database IDs)
export type NewUserPayload = Omit<UserProfile, 'id' | 'isVerified'>;

// D. Record<Keys, ValueType>: Creates a dictionary / map with specified key and value types
export type CategorySpendingMap = Record<string, number>;

const sampleMap: CategorySpendingMap = {
  Food: 4500,
  Transport: 1200,
  Entertainment: 950,
};

// 5. Generic Repository Pattern Interface
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(item: T): Promise<T>;
  delete(id: ID): Promise<boolean>;
}

console.log('[TypeScript Generics] Demonstrated generic functions, interfaces, and utilities.');
