import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeValue } from './server.js';

test('serializeValue', async (t) => {
  await t.test('returns null when input is null or undefined', () => {
    assert.equal(serializeValue(null), null);
    assert.equal(serializeValue(undefined), null);
  });

  await t.test('returns the string exactly as-is when input is a string', () => {
    assert.equal(serializeValue('hello'), 'hello');
    assert.equal(serializeValue(''), '');
  });

  await t.test('returns a JSON stringified value for objects and other types', () => {
    assert.equal(serializeValue({ key: 'value' }), '{"key":"value"}');
    assert.equal(serializeValue([1, 2, 3]), '[1,2,3]');
    assert.equal(serializeValue(42), '42');
    assert.equal(serializeValue(true), 'true');
    assert.equal(serializeValue(false), 'false');
  });
});
