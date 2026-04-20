// Root-level function patterns used to test the root-level function listing feature.

// Exported function declaration — NOT part of public API (not re-exported from index.ts), will be renamed
export function internalExportedFn(): string {
  return 'internal-exported';
}

// Non-exported function declaration — internal, will be renamed
function internalFn(): string {
  return 'internal';
}

// Exported const arrow function — NOT part of public API, will be renamed
export const internalExportedArrow = (): string => 'internal-arrow';

// Non-exported const arrow function — internal, will be renamed
const internalArrow = (): string => 'arrow';

// Exported const function expression — NOT part of public API, will be renamed
export const internalExportedFnExpr = function (): string {
  return 'fn-expr';
};

// Non-exported const function expression — internal, will be renamed
const internalFnExpr = function (): string {
  return 'fn-expr';
};

// Suppress unused-variable warnings by using all symbols
export function useAll(): string {
  return internalFn() + internalArrow() + internalFnExpr();
}
