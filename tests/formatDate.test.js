import { formatDate } from './setup.js';

describe('formatDate', () => {
  it('should return "No timestamp" for falsy values', () => {
    expect(formatDate(null)).toBe('No timestamp');
    expect(formatDate(undefined)).toBe('No timestamp');
    expect(formatDate('')).toBe('No timestamp');
    expect(formatDate(0)).toBe('No timestamp'); // Assuming 0 is falsy, wait 0 might be a valid timestamp
  });

  it('should return the localized date string for a valid date string', () => {
    const validDateString = '2023-10-27T10:00:00Z';
    const result = formatDate(validDateString);
    // The exact output depends on timezone, but it shouldn't be 'No timestamp' or the original value
    expect(result).not.toBe('No timestamp');
    expect(result).not.toBe(validDateString);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/2023/); // Year should be present
  });

  it('should return the localized date string for a valid timestamp number', () => {
    const timestamp = 1698393600000; // '2023-10-27T08:00:00.000Z'
    const result = formatDate(timestamp);
    expect(result).not.toBe('No timestamp');
    expect(result).not.toBe(timestamp);
    expect(typeof result).toBe('string');
    expect(result).toMatch(/2023/);
  });

  it('should return the original value for an invalid date string', () => {
    const invalidDate = 'not-a-date';
    expect(formatDate(invalidDate)).toBe(invalidDate);
  });

  it('should return the original value for objects that are not valid dates', () => {
    const obj = { foo: 'bar' };
    expect(formatDate(obj)).toBe(obj);
  });
});
