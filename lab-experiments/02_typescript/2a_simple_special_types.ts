/**
 * Syllabus Experiment 2a:
 * Program to understand simple and special types in TypeScript.
 * FSD-2 Concept: Primitives (number, string, boolean), Special types (any, unknown, void, null, undefined, never)
 */

// 1. Simple / Primitive Types
const studentName: string = 'Rahul Sharma';
const studentAge: number = 21;
const isEnrolled: boolean = true;

// 2. Special Types:
// 'any': Disables type-checking (use with caution)
let dynamicData: any = 'Initial string';
dynamicData = 100; // Allowed

// 'unknown': Type-safe counterpart of any (requires type narrowing before operations)
const userInput: unknown = '{"amount": 1500}';
if (typeof userInput === 'string') {
  console.log('Parsed JSON length:', userInput.length);
}

// 'void': Represents absence of any type (commonly used for functions with no return value)
function logMessage(msg: string): void {
  console.log(`[Log]: ${msg}`);
}

// 'null' & 'undefined'
const emptyAccount: null = null;
let pendingStatus: undefined = undefined;

// 'never': Represents values that never occur (e.g. functions that always throw or infinite loops)
function throwFatalError(errorMessage: string): never {
  throw new Error(`[Fatal Error]: ${errorMessage}`);
}

logMessage(`Student: ${studentName}, Age: ${studentAge}, Enrolled: ${isEnrolled}`);
