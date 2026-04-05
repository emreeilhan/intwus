import fs from 'fs';
import path from 'path';
import vm from 'vm';

const codePath = path.resolve(process.cwd(), 'public/dashboard.js');
const code = fs.readFileSync(codePath, 'utf8');

// Set up a basic sandbox environment
const sandbox = {
  document: {
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => 'dark'
    },
    getElementById: () => ({
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      querySelector: () => ({ innerHTML: '' }),
      textContent: '',
      innerHTML: ''
    }),
    createElement: () => ({ classList: { add: () => {} }, innerHTML: '' })
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  fetch: () => Promise.resolve({
    json: () => Promise.resolve([])
  }),
  window: {
    StajIcons: {}
  },
  Math,
  String,
  Number,
  Date,
  Array,
  Promise,
  Map,
  setTimeout
};

vm.createContext(sandbox);

// We need to execute the code in the sandbox, but catch errors since init() might fail
// However, function definitions will be hoisted and available in the sandbox.
try {
  vm.runInContext(code, sandbox);
} catch (e) {
  // Ignored, we just want the hoisted function parseCountry
}

const parseCountry = sandbox.parseCountry;

describe('parseCountry', () => {
  it('should be defined', () => {
    expect(parseCountry).toBeDefined();
    expect(typeof parseCountry).toBe('function');
  });

  it('should return empty string for falsy values', () => {
    expect(parseCountry('')).toBe('');
    expect(parseCountry(null)).toBe('');
    expect(parseCountry(undefined)).toBe('');
  });

  it('should extract the last part using comma separator', () => {
    expect(parseCountry('New York, USA')).toBe('USA');
    expect(parseCountry('San Francisco, CA, USA')).toBe('USA');
  });

  it('should extract the last part using slash separator', () => {
    expect(parseCountry('London / UK')).toBe('UK');
  });

  it('should extract the last part using semicolon separator', () => {
    expect(parseCountry('Berlin; Germany')).toBe('Germany');
  });

  it('should extract the last part using middle dot separator', () => {
    expect(parseCountry('Paris · France')).toBe('France');
  });

  it('should handle mixed separators', () => {
    expect(parseCountry('Tokyo / Kanto ; Japan')).toBe('Japan');
  });

  it('should handle trailing whitespace', () => {
    expect(parseCountry('  Rome, Italy  ')).toBe('Italy');
    expect(parseCountry('Amsterdam, Netherlands ,')).toBe('Netherlands');
  });

  it('should return the tag itself if no separators exist', () => {
    expect(parseCountry('Turkey')).toBe('Turkey');
  });

  it('should safely cast non-string inputs to string', () => {
    expect(parseCountry(123)).toBe('123');
    expect(parseCountry({ toString: () => 'Sydney, Australia' })).toBe('Australia');
  });
});
