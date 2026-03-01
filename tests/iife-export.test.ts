import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { createProgramFromConfig } from '../src/program.js';
import { discoverPublicApiSurface } from '../src/api-surface.js';
import { classifySymbols } from '../src/classifier.js';

const TEST_PROJECT = path.resolve(import.meta.dirname, '../test-project/tsconfig.json');

describe('IIFE-exported variable type leaking', () => {
  // Use iife-export.ts as the entry point so `helper` and `createHelper` are public
  const IIFE_ENTRY = path.resolve(import.meta.dirname, '../test-project/src/iife-export.ts');

  let publicNames: Set<string>;
  let prefixedNames: Set<string>;

  beforeAll(() => {
    const program = createProgramFromConfig(TEST_PROJECT);
    const checker = program.getTypeChecker();
    const publicSymbols = discoverPublicApiSurface(program, checker, [IIFE_ENTRY]);
    publicNames = new Set([...publicSymbols].map(s => s.getName()));

    const result = classifySymbols(program, checker, publicSymbols, [IIFE_ENTRY], '_');
    prefixedNames = new Set(result.willPrefix.map(d => d.qualifiedName));
  });

  it('discovers InternalHelper members as public via IIFE-exported variable type', () => {
    // The inferred type of `helper` is InternalHelper, so its members leak
    expect(publicNames.has('value')).toBe(true);
    expect(publicNames.has('compute')).toBe(true);
  });

  it('does NOT prefix members that leak through IIFE return type', () => {
    expect(prefixedNames.has('InternalHelper.value')).toBe(false);
    expect(prefixedNames.has('InternalHelper.compute')).toBe(false);
  });

  it('DOES prefix the InternalHelper class name itself (not directly exported)', () => {
    // The class name is internal — only its shape leaks through the variable type
    expect(prefixedNames.has('InternalHelper')).toBe(true);
  });
});
