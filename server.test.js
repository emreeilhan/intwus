import { test } from 'node:test';
import assert from 'node:assert/strict';
import { serializeValue } from './server.js';

test('serializeValue handles null and undefined', () => {
  assert.equal(serializeValue(null), null);
  assert.equal(serializeValue(undefined), null);
});

test('serializeValue handles strings', () => {
  assert.equal(serializeValue('hello'), 'hello');
  assert.equal(serializeValue(''), '');
});

test('serializeValue handles objects and other types', () => {
  assert.equal(serializeValue({ a: 1 }), '{"a":1}');
  assert.equal(serializeValue([1, 2, 3]), '[1,2,3]');
  assert.equal(serializeValue(123), '123');
  assert.equal(serializeValue(true), 'true');
});
