/**
 * DNR (Declarative Net Request) rule management.
 * Translates domain lists into Chrome DNR rules and applies them.
 */

import { RULE_ID, BLOCKED_PAGE_PATH } from '../shared/constants.js';

/**
 * Build a single DNR rule object for a domain.
 * The rule redirects top-level navigations to the blocked page.
 */
export function buildRule(id, domain) {
  return {
    id,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: `${BLOCKED_PAGE_PATH}?url=${encodeURIComponent(domain)}`,
      },
    },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: ['main_frame'],
    },
  };
}

/**
 * Build an array of DNR rules from a domain list.
 * @param {string[]} domains - Normalized domain strings
 * @param {number} startId - First rule ID to assign
 * @returns {Object[]} Array of DNR rule objects
 */
export function buildRulesFromDomains(domains, startId) {
  return domains.map((domain, index) => buildRule(startId + index, domain));
}

/**
 * Replace all dynamic DNR rules with the given set.
 * Removes all existing dynamic rules first, then adds the new ones.
 */
export async function replaceAllDynamicRules(rules) {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((r) => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules,
  });
}

/**
 * Apply blocking rules for both default and custom domain lists.
 * @param {string[]} defaultDomains
 * @param {string[]} customDomains
 */
export async function applyBlockingRules(defaultDomains, customDomains) {
  const defaultRules = buildRulesFromDomains(defaultDomains, RULE_ID.DEFAULT_START);
  const customRules = buildRulesFromDomains(customDomains, RULE_ID.CUSTOM_START);
  const allRules = [...defaultRules, ...customRules];

  await replaceAllDynamicRules(allRules);
}

/**
 * Remove all dynamic blocking rules (used when disabling).
 */
export async function removeAllBlockingRules() {
  await replaceAllDynamicRules([]);
}
