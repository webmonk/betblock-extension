/**
 * Thin wrapper around chrome.storage.local.
 * Provides typed getters/setters for each stored value.
 */

import { STORAGE_KEYS, DEFAULT_STORAGE } from '../shared/constants.js';

/**
 * Initialize storage with default values.
 * Only sets keys that don't already exist (preserves existing data on update).
 */
export async function initializeStorage() {
  const current = await chrome.storage.local.get(null);

  const toSet = {};
  for (const [key, value] of Object.entries(DEFAULT_STORAGE)) {
    if (current[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }
}

export async function getEnabled() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ENABLED);
  return result[STORAGE_KEYS.ENABLED] ?? DEFAULT_STORAGE[STORAGE_KEYS.ENABLED];
}

export async function setEnabled(value) {
  await chrome.storage.local.set({ [STORAGE_KEYS.ENABLED]: Boolean(value) });
}

export async function getCustomDomains() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CUSTOM_DOMAINS);
  return result[STORAGE_KEYS.CUSTOM_DOMAINS] ?? [];
}

export async function setCustomDomains(domains) {
  if (!Array.isArray(domains)) {
    throw new Error('customDomains must be an array');
  }
  await chrome.storage.local.set({ [STORAGE_KEYS.CUSTOM_DOMAINS]: domains });
}

export async function getDisableRequiresConfirmation() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION);
  return result[STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION] ?? true;
}

export async function setDisableRequiresConfirmation(value) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION]: Boolean(value),
  });
}

export async function getStats() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  return result[STORAGE_KEYS.STATS] ?? DEFAULT_STORAGE[STORAGE_KEYS.STATS];
}

export async function incrementBlockCount() {
  const stats = await getStats();
  stats.totalBlocked += 1;
  stats.lastBlockedAt = new Date().toISOString();
  await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
}
