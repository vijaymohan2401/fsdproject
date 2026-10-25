# TypeScript Companion Practice Module (FSD-2 Lab Companion)

This companion module demonstrates the core **TypeScript concepts prescribed in the Full Stack Development - 2 (FSD-2) syllabus**. While the main SpendWise application is built with standard modern JavaScript to keep architecture clean and beginner-friendly, this folder serves as your hands-on demonstration and viva prep companion.

---

## 📚 Syllabus Concepts Demonstrated

| File | FSD-2 Syllabus Topics | Viva Demonstration Key Points |
| :--- | :--- | :--- |
| `01_basics_and_types.ts` | Type annotations, Type inference, Arrays, Tuples, Enums, Union types, Intersection types | Explains how static typing catches bugs during compilation rather than at runtime. |
| `02_interfaces_and_classes.ts` | Interfaces, Optional properties, Readonly properties, OOP Classes, Access modifiers (`private`, `protected`, `public`), `implements`, `extends` | Demonstrates encapsulation and object-oriented architecture in TypeScript. |
| `03_generics_and_utility.ts` | Generic functions (`<T>`), Generic interfaces, Built-in Utility types: `Partial<T>`, `Pick<T>`, `Omit<T>`, `Record<K,V>` | Shows how reusable API envelopes and partial updates are modeled without code duplication. |
| `04_spendwise_domain_models.ts` | Application data contracts, Transaction & Budget models, Category string unions | Illustrates how SpendWise's database models map directly into TypeScript types. |
| `05_async_and_type_guards.ts` | User-defined type guards (`arg is Type`), Exhaustive type checking with `never`, Async `Promise<T>` | Highlights advanced type narrowing and robust compile-time completeness checks. |

---

## 🎓 Common College Examination Viva Q&A

### Q1: What is the key difference between TypeScript and JavaScript?
> **Answer:** JavaScript is dynamically typed, meaning types are checked at runtime. TypeScript is a statically typed superset of JavaScript that compiles down to standard JavaScript. TypeScript catches type mismatches, missing properties, and misspelled keys at compile time.

### Q2: What is the difference between an `interface` and a `type` alias?
> **Answer:**
> - `interface` is primarily designed for defining object structures and can be extended through inheritance (`extends`) or merged through declaration merging.
> - `type` aliases can represent primitive types, unions, intersections, tuples, and functions in addition to objects.

### Q3: What are Generics in TypeScript?
> **Answer:** Generics allow us to write flexible, reusable code that can work over a variety of types rather than a single one, while still preserving complete type safety (e.g. `ApiResponse<T>`).

### Q4: What does the `Partial<T>` utility type do?
> **Answer:** It constructs a type with all properties of `T` set to optional. This is especially useful for HTTP `PATCH` or `PUT` endpoints where only a few fields of a resource are updated.

---

## 🛠️ How to Compile / Type Check

From this folder:
```bash
npm install
npm run type-check
```
