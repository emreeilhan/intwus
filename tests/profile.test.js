import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const profileJsContent = fs.readFileSync(path.resolve('public/profile.js'), 'utf-8');

const getFunctions = () => {
    let result = {};
    const code = profileJsContent + `\nreturn { textareaToLines };`;
    const sandbox = {
        document: {
            getElementById: () => ({ value: '', addEventListener: () => {} }),
            documentElement: { setAttribute: () => {}, getAttribute: () => {} }
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        window: {},
        fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        console: { error: () => {} }
    };
    const fn = new Function('document', 'localStorage', 'window', 'fetch', 'console', code);
    return fn(sandbox.document, sandbox.localStorage, sandbox.window, sandbox.fetch, sandbox.console);
};

const { textareaToLines } = getFunctions();

describe('textareaToLines', () => {
    it('splits string with LF newlines', () => {
        assert.deepStrictEqual(textareaToLines('line 1\nline 2\nline 3'), ['line 1', 'line 2', 'line 3']);
    });

    it('splits string with CRLF newlines', () => {
        assert.deepStrictEqual(textareaToLines('line 1\r\nline 2\r\nline 3'), ['line 1', 'line 2', 'line 3']);
    });

    it('trims whitespace from lines', () => {
        assert.deepStrictEqual(textareaToLines('  line 1  \n\tline 2\t\n line 3 '), ['line 1', 'line 2', 'line 3']);
    });

    it('filters out empty lines', () => {
        assert.deepStrictEqual(textareaToLines('line 1\n\nline 2\n  \nline 3'), ['line 1', 'line 2', 'line 3']);
    });

    it('handles single line string', () => {
        assert.deepStrictEqual(textareaToLines('line 1'), ['line 1']);
    });

    it('handles empty string', () => {
        assert.deepStrictEqual(textareaToLines(''), []);
    });

    it('handles string with only whitespace', () => {
        assert.deepStrictEqual(textareaToLines('   \n  \t  \n '), []);
    });

    it('handles undefined input', () => {
        assert.deepStrictEqual(textareaToLines(undefined), []);
    });

    it('handles null input', () => {
        assert.deepStrictEqual(textareaToLines(null), []);
    });

    it('handles non-string input (e.g. number)', () => {
        assert.deepStrictEqual(textareaToLines(123), ['123']);
    });
});
