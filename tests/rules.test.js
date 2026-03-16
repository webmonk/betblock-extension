/**
 * Tests for rules.js — rule building logic.
 * Chrome API calls are not tested here (those require integration testing).
 */

import { buildRule, buildRulesFromDomains } from '../src/background/rules.js';

test('buildRule creates correct structure', () => {
  const rule = buildRule(1, 'example.com');

  assert.equal(rule.id, 1);
  assert.equal(rule.priority, 1);
  assert.equal(rule.action.type, 'redirect');
  assert.ok(rule.action.redirect.extensionPath.includes('blocked.html'));
  assert.ok(rule.action.redirect.extensionPath.includes('example.com'));
  assert.equal(rule.condition.urlFilter, '||example.com');
  assert.deepEqual(rule.condition.resourceTypes, ['main_frame']);
});

test('buildRule encodes domain in redirect URL', () => {
  const rule = buildRule(5, 'bet365.com');
  assert.ok(rule.action.redirect.extensionPath.includes('bet365.com'));
});

test('buildRulesFromDomains assigns sequential IDs', () => {
  const rules = buildRulesFromDomains(['a.com', 'b.com', 'c.com'], 100);

  assert.equal(rules.length, 3);
  assert.equal(rules[0].id, 100);
  assert.equal(rules[1].id, 101);
  assert.equal(rules[2].id, 102);
});

test('buildRulesFromDomains maps each domain', () => {
  const rules = buildRulesFromDomains(['foo.com', 'bar.org'], 1);

  assert.equal(rules[0].condition.urlFilter, '||foo.com');
  assert.equal(rules[1].condition.urlFilter, '||bar.org');
});

test('buildRulesFromDomains handles empty array', () => {
  const rules = buildRulesFromDomains([], 1);
  assert.deepEqual(rules, []);
});
