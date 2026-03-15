import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { prefixInternals } from '../src/index.js';
import type { FullResult } from '../src/index.js';

const TEST_PROJECT = path.resolve(import.meta.dirname, '../test-project/tsconfig.json');
const TEST_ENTRY = path.resolve(import.meta.dirname, '../test-project/src/index.ts');

describe('object literal key mismatch detection', () => {
    let result: FullResult;
    let content: string;
    const outDir = path.join(os.tmpdir(), 'ts-prefix-obj-literal-' + Date.now());

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
            strict: true,
        });
        content = fs.readFileSync(path.join(outDir, 'src', 'object-literal-mismatch.ts'), 'utf-8');
    });

    afterAll(() => {
        fs.rmSync(outDir, { recursive: true, force: true });
    });

    it('renames width/height in the parameter type', () => {
        // The parameter type { width?: number; height?: number } should be renamed
        expect(content).toContain('_width');
        expect(content).toContain('_height');
    });

    it('renames width/height in property accesses', () => {
        // fields.width should become fields._width
        expect(content).toContain('fields._width');
        expect(content).toContain('fields._height');
    });

    it('renames object literal keys to match parameter type', () => {
        // Object literal keys should be renamed to match the parameter type.
        // { width: 100 } → { _width: 100 }
        expect(content).toContain('{ _width: 100 }');
        expect(content).toContain('{ _height: 200 }');
        expect(content).toContain('{ _width: 100, _height: 200 }');
    });

    it('does not produce validation errors in the object-literal-mismatch file', () => {
        const relevant = (result.validationErrors ?? []).filter(e =>
            e.includes('object-literal-mismatch'),
        );
        expect(relevant).toEqual([]);
    });
});
