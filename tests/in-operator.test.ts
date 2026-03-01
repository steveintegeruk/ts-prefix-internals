import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { prefixInternals } from '../src/index.js';
import type { FullResult } from '../src/index.js';

const TEST_PROJECT = path.resolve(import.meta.dirname, '../test-project/tsconfig.json');
const TEST_ENTRY = path.resolve(import.meta.dirname, '../test-project/src/index.ts');

describe('in operator string literal renaming', () => {
  let result: FullResult;
  let content: string;
  const outDir = path.join(os.tmpdir(), 'ts-prefix-in-operator-' + Date.now());

  beforeAll(async () => {
    result = await prefixInternals({
      projectPath: TEST_PROJECT,
      entryPoints: [TEST_ENTRY],
      outDir,
      prefix: '_',
      dryRun: false,
      verbose: false,
      skipValidation: false,
      force: false,
      strict: false,
    });
    content = fs.readFileSync(path.join(outDir, 'src', 'in-operator.ts'), 'utf-8');
  });

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('renames string literal in `in` expression on concrete internal type', () => {
    // 'connect' is a method on internal class LinkMap — it gets prefixed
    expect(content).toContain("'_connect' in map");
  });

  it('does NOT rename `in` expression when RHS is unknown', () => {
    // obj is unknown — can't resolve type, so leave the string alone
    expect(content).toContain("'connect' in obj");
  });

  it('renames string literals in discriminated union type guards', () => {
    // 'forward' is an internal property — it gets prefixed
    expect(content).toContain("'_forward' in u");
    expect(content).not.toContain("'forward' in u");
  });

  it('produces no validation errors', () => {
    const unexpected = result.validationErrors?.filter(e => !e.includes('unsafe-patterns'));
    expect(unexpected?.length ? unexpected : undefined).toBeUndefined();
  });
});
