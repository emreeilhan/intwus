import { describe, it } from 'node:test';
import assert from 'node:assert';
import { safeJsonParse } from './server.js';

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    assert.deepStrictEqual(safeJsonParse('{"a": 1}', {}), { a: 1 });
  });

  it('should return fallback for invalid JSON', () => {
    assert.strictEqual(safeJsonParse('{invalid', 'fallback_value'), 'fallback_value');
  });

  it('should return fallback for null/empty/undefined string', () => {
    assert.strictEqual(safeJsonParse('', 'fallback_value'), 'fallback_value');
    assert.strictEqual(safeJsonParse(null, 'fallback_value'), 'fallback_value');
    assert.strictEqual(safeJsonParse(undefined, 'fallback_value'), 'fallback_value');
  });
});
