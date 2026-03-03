/**
 * Background service worker.
 * Handles extension lifecycle events and message routing.
 */

import { DEFAULT_DOMAINS } from '../blocklist/default-domains.js';
import { applyBlockingRules, removeAllBlockingRules } from './rules.js';
import {
  initializeStorage,
  getEnabled,
  setEnabled,
  getCustomDomains,
  setCustomDomains,
  incrementBlockCount,
} from '../storage/storage.js';
import { cleanDomainList } from '../shared/domain-utils.js';

/**
 * Apply or remove blocking rules based on the current enabled state.
 */
async function syncBlockingState() {
  const enabled = await getEnabled();

  if (enabled) {
    const customDomains = await getCustomDomains();
    await applyBlockingRules(DEFAULT_DOMAINS, customDomains);
  } else {
    await removeAllBlockingRules();
  }
}

// First install or extension update
chrome.runtime.onInstalled.addListener(async (details) => {
  await initializeStorage();
  await syncBlockingState();

  if (details.reason === 'install') {
    console.log('BetBlock installed. Blocking is active.');
  }
});

// Service worker startup (e.g. after browser restart)
chrome.runtime.onStartup.addListener(async () => {
  await syncBlockingState();
});

// Message handler for popup and options page communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: err.message }));

  // Return true to indicate async response
  return true;
});

/**
 * Route incoming messages to the appropriate handler.
 */
async function handleMessage(message) {
  switch (message.type) {
    case 'GET_STATE':
      return {
        enabled: await getEnabled(),
        customDomains: await getCustomDomains(),
      };

    case 'SET_ENABLED': {
      await setEnabled(message.value);
      await syncBlockingState();
      return { enabled: await getEnabled() };
    }

    case 'ADD_CUSTOM_DOMAINS': {
      const current = await getCustomDomains();
      const cleaned = cleanDomainList([...current, ...message.domains]);
      await setCustomDomains(cleaned);
      await syncBlockingState();
      return { customDomains: cleaned };
    }

    case 'REMOVE_CUSTOM_DOMAIN': {
      const current = await getCustomDomains();
      const updated = current.filter((d) => d !== message.domain);
      await setCustomDomains(updated);
      await syncBlockingState();
      return { customDomains: updated };
    }

    case 'SET_CUSTOM_DOMAINS': {
      const cleaned = cleanDomainList(message.domains);
      await setCustomDomains(cleaned);
      await syncBlockingState();
      return { customDomains: cleaned };
    }

    case 'INCREMENT_BLOCK_COUNT': {
      await incrementBlockCount();
      return { success: true };
    }

    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}
