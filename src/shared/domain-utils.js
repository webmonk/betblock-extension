/**
 * Utilities for parsing, validating, and normalizing domain names.
 */

// Matches a valid domain: at least one label + a TLD, each label alphanumeric
// with hyphens allowed (but not leading/trailing).
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

/**
 * Normalize a raw user input string into a clean domain.
 * Strips protocol, www prefix, paths, ports, whitespace.
 * Returns lowercase trimmed domain or null if invalid.
 */
export function normalizeDomain(input) {
  if (typeof input !== 'string') return null;

  let domain = input.trim().toLowerCase();

  // Strip protocol
  domain = domain.replace(/^https?:\/\//, '');

  // Strip path, query, fragment
  domain = domain.split(/[/?#]/)[0];

  // Strip port
  domain = domain.split(':')[0];

  // Strip www. prefix
  domain = domain.replace(/^www\./, '');

  // Strip trailing dots
  domain = domain.replace(/\.+$/, '');

  if (!domain) return null;

  return domain;
}

/**
 * Check whether a string is a valid domain after normalization.
 */
export function isValidDomain(input) {
  const domain = normalizeDomain(input);
  if (!domain) return false;
  return DOMAIN_REGEX.test(domain);
}

/**
 * Deduplicate and sort a list of domains.
 * Invalid entries are silently removed.
 */
export function cleanDomainList(domains) {
  if (!Array.isArray(domains)) return [];

  const seen = new Set();
  const result = [];

  for (const raw of domains) {
    const domain = normalizeDomain(raw);
    if (domain && isValidDomain(domain) && !seen.has(domain)) {
      seen.add(domain);
      result.push(domain);
    }
  }

  return result.sort();
}
