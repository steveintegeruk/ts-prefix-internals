// iife-export.ts — test case for IIFE-exported variable type leaking

// Internal class (not exported from barrel)
class InternalHelper {
  value = 0;
  compute(): number {
    return this.value * 2;
  }
}

// Exported via IIFE — inferred type is InternalHelper
// Its public members should become part of the public API
export const helper = (() => new InternalHelper())();

// Also export a function that returns an internal type
export function createHelper() {
  return new InternalHelper();
}
