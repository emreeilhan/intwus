import test from 'node:test';
import assert from 'node:assert';
import { compareFieldChanges } from './server.js';

test('compareFieldChanges', async (t) => {
  await t.test('returns empty object when no changes exist', () => {
    const before = { status: 'Applied', fit_score: 5 };
    const after = { status: 'Applied', fit_score: 5 };
    const result = compareFieldChanges(before, after);
    assert.deepStrictEqual(result, {});
  });

  await t.test('detects changed fields', () => {
    const before = { status: 'Applied', priority: 'Medium' };
    const after = { status: 'Interviewing', priority: 'High' };
    const result = compareFieldChanges(before, after);
    assert.deepStrictEqual(result, {
      status: { before: 'Applied', after: 'Interviewing' },
      priority: { before: 'Medium', after: 'High' }
    });
  });

  await t.test('handles missing fields in before object', () => {
    const before = { status: 'Applied' };
    const after = { status: 'Applied', notes: 'Great company' };
    const result = compareFieldChanges(before, after);
    assert.deepStrictEqual(result, {
      notes: { before: '', after: 'Great company' }
    });
  });

  await t.test('handles falsy values like empty strings properly', () => {
    const before = { notes: 'Old notes', website: 'https://example.com' };
    const after = { notes: '', website: '' };
    const result = compareFieldChanges(before, after);
    assert.deepStrictEqual(result, {
      notes: { before: 'Old notes', after: '' },
      website: { before: 'https://example.com', after: '' }
    });
  });

  await t.test('ignores fields not present in after object', () => {
    const before = { status: 'Applied', extra_field: 'something' };
    const after = { status: 'Applied' };
    // `compareFieldChanges` iterates over Object.keys(after),
    // so fields only in `before` are ignored.
    const result = compareFieldChanges(before, after);
    assert.deepStrictEqual(result, {});
  });

  await t.test('correctly handles undefined or nullish values in after object via fallback to empty string', () => {
    const before = { priority: 'High' };
    const after = { priority: undefined };
    const result = compareFieldChanges(before, after);
    assert.deepStrictEqual(result, {
      priority: { before: 'High', after: '' }
    });
  });
});
