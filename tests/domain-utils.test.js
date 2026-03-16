/**
 * Tests for domain-utils.js
 */

import { normalizeDomain, isValidDomain, cleanDomainList } from '../src/shared/domain-utils.js';

// --- normalizeDomain ---

test('strips protocol', () => {
  assert.equal(normalizeDomain('https://example.com'), 'example.com');
  assert.equal(normalizeDomain('http://example.com'), 'example.com');
});

test('strips www prefix', () => {
  assert.equal(normalizeDomain('www.example.com'), 'example.com');
});

test('strips path, query, and fragment', () => {
  assert.equal(normalizeDomain('example.com/path?q=1#hash'), 'example.com');
});

test('strips port', () => {
  assert.equal(normalizeDomain('example.com:8080'), 'example.com');
});

test('lowercases input', () => {
  assert.equal(normalizeDomain('EXAMPLE.COM'), 'example.com');
});

test('trims whitespace', () => {
  assert.equal(normalizeDomain('  example.com  '), 'example.com');
});

test('strips trailing dots', () => {
  assert.equal(normalizeDomain('example.com.'), 'example.com');
});

test('handles combined protocol + www + path', () => {
  assert.equal(normalizeDomain('https://www.example.com/page'), 'example.com');
});

test('returns null for empty string', () => {
  assert.equal(normalizeDomain(''), null);
});

test('returns null for non-string input', () => {
  assert.equal(normalizeDomain(null), null);
  assert.equal(normalizeDomain(undefined), null);
  assert.equal(normalizeDomain(123), null);
});

// --- isValidDomain ---

test('accepts valid domains', () => {
  assert.ok(isValidDomain('example.com'));
  assert.ok(isValidDomain('sub.example.com'));
  assert.ok(isValidDomain('bet365.com'));
  assert.ok(isValidDomain('my-site.co.uk'));
});

test('rejects invalid domains', () => {
  assert.equal(isValidDomain(''), false);
  assert.equal(isValidDomain('just-a-word'), false);
  assert.equal(isValidDomain('192.168.1.1'), false);
  assert.equal(isValidDomain('.com'), false);
  assert.equal(isValidDomain('exam ple.com'), false);
});

// --- cleanDomainList ---

test('deduplicates domains', () => {
  const result = cleanDomainList(['example.com', 'example.com', 'EXAMPLE.COM']);
  assert.deepEqual(result, ['example.com']);
});

test('removes invalid entries', () => {
  const result = cleanDomainList(['example.com', '', 'not valid', 'good.org']);
  assert.deepEqual(result, ['example.com', 'good.org']);
});

test('sorts alphabetically', () => {
  const result = cleanDomainList(['zoo.com', 'alpha.com', 'mid.com']);
  assert.deepEqual(result, ['alpha.com', 'mid.com', 'zoo.com']);
});

test('handles non-array input', () => {
  assert.deepEqual(cleanDomainList(null), []);
  assert.deepEqual(cleanDomainList('string'), []);
});

test('normalizes during cleaning', () => {
  const result = cleanDomainList(['https://www.Example.COM/path', 'example.com']);
  assert.deepEqual(result, ['example.com']);
});
