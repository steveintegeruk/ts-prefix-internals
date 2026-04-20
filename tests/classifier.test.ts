import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { createProgramFromConfig } from '../src/program.js';
import { discoverPublicApiSurface } from '../src/api-surface.js';
import { classifySymbols } from '../src/classifier.js';

const TEST_PROJECT = path.resolve(import.meta.dirname, '../test-project/tsconfig.json');
const TEST_ENTRY = path.resolve(import.meta.dirname, '../test-project/src/index.ts');

describe('classifier', () => {
  function getClassification() {
    const program = createProgramFromConfig(TEST_PROJECT);
    const checker = program.getTypeChecker();
    const publicSymbols = discoverPublicApiSurface(program, checker, [TEST_ENTRY]);
    return classifySymbols(program, checker, publicSymbols, [TEST_ENTRY], '_');
  }

  it('marks internal class as prefix', () => {
    const result = getClassification();
    const prefixNames = result.willPrefix.map(d => d.qualifiedName);
    expect(prefixNames).toContain('LinkMap');
  });

  it('marks private members of public class as prefix', () => {
    const result = getClassification();
    const prefixNames = result.willPrefix.map(d => d.qualifiedName);
    expect(prefixNames).toContain('Processor.links');
    expect(prefixNames).toContain('Processor.pending');
    expect(prefixNames).toContain('Processor.cache');
    expect(prefixNames).toContain('Processor.toKey');
    expect(prefixNames).toContain('Processor.mark');
    expect(prefixNames).toContain('Processor.refresh');
  });

  it('marks internal functions as prefix', () => {
    const result = getClassification();
    const prefixNames = result.willPrefix.map(d => d.qualifiedName);
    expect(prefixNames).toContain('makeKey');
    expect(prefixNames).toContain('splitKey');
    expect(prefixNames).toContain('summarizeShape');
  });

  it('marks internal type aliases and their members as prefix', () => {
    const result = getClassification();
    const prefixNames = result.willPrefix.map(d => d.qualifiedName);
    expect(prefixNames).toContain('InternalShape');
    expect(prefixNames).toContain('InternalShape.count');
    expect(prefixNames).toContain('InternalShape.label');
  });

  it('marks all members of internal class as prefix', () => {
    const result = getClassification();
    const prefixNames = result.willPrefix.map(d => d.qualifiedName);
    expect(prefixNames).toContain('LinkMap.forward');
    expect(prefixNames).toContain('LinkMap.reverse');
    expect(prefixNames).toContain('LinkMap.connect');
    expect(prefixNames).toContain('LinkMap.followers');
    expect(prefixNames).toContain('LinkMap.targets');
    expect(prefixNames).toContain('LinkMap.hasLoop');
  });

  it('does NOT mark public class as prefix', () => {
    const result = getClassification();
    const noPrefixNames = result.willNotPrefix.map(d => d.qualifiedName);
    expect(noPrefixNames).toContain('Processor');
  });

  it('does NOT mark public methods as prefix', () => {
    const result = getClassification();
    const noPrefixNames = result.willNotPrefix.map(d => d.qualifiedName);
    expect(noPrefixNames).toContain('Processor.setEntry');
    expect(noPrefixNames).toContain('Processor.getEntry');
  });

  it('does NOT mark exported interfaces as prefix', () => {
    const result = getClassification();
    const noPrefixNames = result.willNotPrefix.map(d => d.qualifiedName);
    expect(noPrefixNames).toContain('Coord');
    expect(noPrefixNames).toContain('CoordRange');
    expect(noPrefixNames).toContain('CoordKind');
  });

  it('does NOT mark exported interface members as prefix', () => {
    const result = getClassification();
    const noPrefixNames = result.willNotPrefix.map(d => d.qualifiedName);
    expect(noPrefixNames).toContain('Coord.ns');
    expect(noPrefixNames).toContain('Coord.x');
    expect(noPrefixNames).toContain('Coord.y');
  });

  it('does NOT mark exported enum members as prefix', () => {
    const result = getClassification();
    const noPrefixNames = result.willNotPrefix.map(d => d.qualifiedName);
    expect(noPrefixNames).toContain('CoordKind.Alpha');
    expect(noPrefixNames).toContain('CoordKind.Beta');
    expect(noPrefixNames).toContain('CoordKind.Gamma');
  });

  it('rootLevelFunctions includes FunctionDeclaration entries', () => {
    const result = getClassification();
    const fns = result.rootLevelFunctions;
    const names = fns.map(f => f.name);
    // makeKey is an exported function declaration in utils.ts (not in public API → will be renamed)
    expect(names).toContain('makeKey');
    const makeKeyEntry = fns.find(f => f.name === 'makeKey')!;
    expect(makeKeyEntry.kind).toBe('FunctionDeclaration');
    expect(makeKeyEntry.willRename).toBe(true);
    expect(makeKeyEntry.newName).toBe('_makeKey');
  });

  it('rootLevelFunctions marks public API function as not renamed', () => {
    const result = getClassification();
    const fns = result.rootLevelFunctions;
    // buildSpec is exported from wrapper.ts and re-exported from index.ts (public API)
    const buildSpecEntry = fns.find(f => f.name === 'buildSpec');
    expect(buildSpecEntry).toBeDefined();
    expect(buildSpecEntry!.willRename).toBe(false);
    expect(buildSpecEntry!.reason).toBe('public API');
    expect(buildSpecEntry!.kind).toBe('FunctionDeclaration');
  });

  it('rootLevelFunctions includes VariableArrowFunction entries', () => {
    const result = getClassification();
    const fns = result.rootLevelFunctions;
    const arrowEntry = fns.find(f => f.name === 'internalArrow');
    expect(arrowEntry).toBeDefined();
    expect(arrowEntry!.kind).toBe('VariableArrowFunction');
    expect(arrowEntry!.willRename).toBe(true);
    expect(arrowEntry!.newName).toBe('_internalArrow');
  });

  it('rootLevelFunctions includes VariableFunctionExpression entries', () => {
    const result = getClassification();
    const fns = result.rootLevelFunctions;
    const fnExprEntry = fns.find(f => f.name === 'internalFnExpr');
    expect(fnExprEntry).toBeDefined();
    expect(fnExprEntry!.kind).toBe('VariableFunctionExpression');
    expect(fnExprEntry!.willRename).toBe(true);
    expect(fnExprEntry!.newName).toBe('_internalFnExpr');
  });

  it('rootLevelFunctions includes exported arrow function not in public API (marked renamed)', () => {
    const result = getClassification();
    const fns = result.rootLevelFunctions;
    const entry = fns.find(f => f.name === 'internalExportedArrow');
    expect(entry).toBeDefined();
    expect(entry!.kind).toBe('VariableArrowFunction');
    expect(entry!.willRename).toBe(true);
    expect(entry!.newName).toBe('_internalExportedArrow');
  });

  it('rootLevelFunctions provides fileName and line for each entry', () => {
    const result = getClassification();
    const fns = result.rootLevelFunctions;
    for (const f of fns) {
      expect(typeof f.fileName).toBe('string');
      expect(f.fileName.length).toBeGreaterThan(0);
      expect(typeof f.line).toBe('number');
      expect(f.line).toBeGreaterThan(0);
    }
  });
});
