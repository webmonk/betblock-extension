/**
 * Shared constants used across the extension.
 */

// chrome.storage.local keys
export const STORAGE_KEYS = {
  ENABLED: 'enabled',
  CUSTOM_DOMAINS: 'customDomains',
  DISABLE_REQUIRES_CONFIRMATION: 'disableRequiresConfirmation',
  STATS: 'stats',
};

// DNR rule ID ranges
export const RULE_ID = {
  DEFAULT_START: 1,
  DEFAULT_MAX: 10000,
  CUSTOM_START: 10001,
  CUSTOM_MAX: 20000,
};

// Default storage values set on first install
export const DEFAULT_STORAGE = {
  [STORAGE_KEYS.ENABLED]: true,
  [STORAGE_KEYS.CUSTOM_DOMAINS]: [],
  [STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION]: true,
  [STORAGE_KEYS.STATS]: {
    totalBlocked: 0,
    lastBlockedAt: null,
  },
};

// The confirmation phrase users must type to disable blocking
export const DISABLE_CONFIRMATION_PHRASE = 'I want to disable blocking';

// Path to the blocked page (relative to extension root)
export const BLOCKED_PAGE_PATH = '/src/pages/blocked/blocked.html';
