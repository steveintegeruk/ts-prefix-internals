import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { prefixInternals } from '../src/index.js';
import type { FullResult } from '../src/index.js';

const TEST_PROJECT = path.resolve(import.meta.dirname, '../test-project/tsconfig.json');
const TEST_ENTRY = path.resolve(import.meta.dirname, '../test-project/src/index.ts');

describe('edge cases', () => {
  let result: FullResult;
  let content: string;
  const outDir = path.join(os.tmpdir(), 'ts-prefix-edge-cases-' + Date.now());

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
    content = fs.readFileSync(path.join(outDir, 'src', 'edge-cases.ts'), 'utf-8');
  });

  afterAll(() => {
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  describe('internal enum members', () => {
    it('prefixes the enum name', () => {
      expect(content).toContain('enum _Priority');
    });

    it('prefixes enum member names', () => {
      expect(content).toContain('_Low');
      expect(content).toContain('_Medium');
      expect(content).toContain('_High');
    });

    it('renames dot-access to enum members', () => {
      expect(content).toContain('_Priority._High');
      expect(content).toContain('_Priority._Medium');
      expect(content).toContain('_Priority._Low');
    });
  });

  describe('mapped types (Readonly, Partial)', () => {
    it('renames properties accessed through Readonly<T>', () => {
      expect(content).toContain('frozen._maxRetries');
      expect(content).toContain('frozen._timeout');
      expect(content).toContain('frozen._debug');
    });

    it('renames properties accessed through Partial<T>', () => {
      expect(content).toContain('partial._maxRetries');
      expect(content).toContain('partial._timeout');
    });

    it('renames property declarations in the internal interface', () => {
      expect(content).toContain('_maxRetries: number');
      expect(content).toContain('_timeout: number');
      expect(content).toContain('_debug: boolean');
    });
  });

  describe('default parameter values', () => {
    it('renames property keys in default value object literals', () => {
      expect(content).toContain('{ _enabled: true, _count: 5 }');
    });
  });

  describe('constructor parameter properties', () => {
    it('renames private constructor parameters', () => {
      expect(content).toContain('private _config');
      expect(content).toContain('private _label');
    });

    it('renames references to constructor params in method body', () => {
      expect(content).toContain('this._label');
      expect(content).toContain('this._config._maxRetries');
    });
  });

  describe('static members', () => {
    it('prefixes private static fields', () => {
      expect(content).toContain('private static _instance');
      expect(content).toContain('private static _counter');
    });

    it('renames static member access', () => {
      expect(content).toContain('_InternalRegistry._instance');
      expect(content).toContain('_InternalRegistry._counter');
    });
  });

  describe('prototype access', () => {
    it('renames method access via prototype chain', () => {
      expect(content).toContain('_InternalWorker.prototype._process');
    });
  });

  describe('cross-instance private field access', () => {
    it('renames private field access on other instance', () => {
      expect(content).toContain('other._score');
      expect(content).toContain('this._score');
    });
  });

  describe('output validity', () => {
    it('produces no validation errors', () => {
      const unexpected = result.validationErrors?.filter(e => !e.includes('unsafe-patterns'));
      expect(unexpected?.length ? unexpected : undefined).toBeUndefined();
    });
  });
});
