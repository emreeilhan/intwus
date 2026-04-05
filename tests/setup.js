import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the profile.js file
const profileJsPath = path.resolve(__dirname, '../public/profile.js');
const profileJsContent = fs.readFileSync(profileJsPath, 'utf-8');

import vm from 'vm';

const context = {
  document: {
    getElementById: () => ({
      addEventListener: () => {},
      value: '',
      textContent: ''
    }),
    documentElement: {
      setAttribute: () => {},
      getAttribute: () => 'dark'
    }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  console: console,
  module: { exports: {} },
  window: {
    StajIcons: {},
    jest: true
  }
};

vm.createContext(context);
vm.runInContext(profileJsContent, context);

export const formatDate = context.module.exports.formatDate;
