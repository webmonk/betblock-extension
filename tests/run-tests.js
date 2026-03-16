/**
 * Minimal test runner.
 * Discovers and runs all *.test.js files in this directory.
 */

import { readdir } from 'fs/promises';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let totalPassed = 0;
let totalFailed = 0;
const failures = [];

/**
 * Simple assertion library exposed to test files via globalThis.
 */
globalThis.assert = {
  equal(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(
        `${message ? message + ': ' : ''}Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
  },

  deepEqual(actual, expected, message = '') {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(`${message ? message + ': ' : ''}Expected ${e}, got ${a}`);
    }
  },

  ok(value, message = '') {
    if (!value) {
      throw new Error(`${message ? message + ': ' : ''}Expected truthy value, got ${JSON.stringify(value)}`);
    }
  },

  throws(fn, message = '') {
    try {
      fn();
      throw new Error(`${message ? message + ': ' : ''}Expected function to throw`);
    } catch (err) {
      if (err.message.includes('Expected function to throw')) throw err;
    }
  },
};

/**
 * Test registration function exposed globally.
 */
const tests = [];

globalThis.test = function (name, fn) {
  tests.push({ name, fn });
};

async function runFile(filePath) {
  tests.length = 0;

  await import(pathToFileURL(filePath).href);

  const fileName = filePath.split(/[\\/]/).pop();
  console.log(`\n  ${fileName}`);

  for (const { name, fn } of tests) {
    try {
      await fn();
      totalPassed++;
      console.log(`    \x1b[32m✓\x1b[0m ${name}`);
    } catch (err) {
      totalFailed++;
      console.log(`    \x1b[31m✗\x1b[0m ${name}`);
      console.log(`      ${err.message}`);
      failures.push({ file: fileName, name, error: err.message });
    }
  }
}

async function main() {
  const files = (await readdir(__dirname))
    .filter((f) => f.endsWith('.test.js'))
    .sort();

  console.log(`\nBetBlock Tests`);
  console.log('─'.repeat(40));

  for (const file of files) {
    await runFile(join(__dirname, file));
  }

  console.log('\n' + '─'.repeat(40));
  console.log(
    `  \x1b[32m${totalPassed} passed\x1b[0m` +
      (totalFailed > 0 ? `, \x1b[31m${totalFailed} failed\x1b[0m` : '')
  );

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  ${f.file} > ${f.name}: ${f.error}`);
    }
    process.exit(1);
  }

  console.log('');
}

main();
