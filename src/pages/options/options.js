/**
 * Options page script.
 * Manages settings, custom domain list, and import/export.
 */

import { STORAGE_KEYS } from '../../shared/constants.js';
import { DEFAULT_DOMAINS } from '../../blocklist/default-domains.js';
import { isValidDomain, normalizeDomain } from '../../shared/domain-utils.js';

// DOM elements
const statusBadge = document.getElementById('status-badge');
const enabledToggle = document.getElementById('enabled-toggle');
const confirmToggle = document.getElementById('confirm-toggle');
const totalBlockedEl = document.getElementById('total-blocked');
const lastBlockedEl = document.getElementById('last-blocked');
const defaultCountEl = document.getElementById('default-count');
const customCountEl = document.getElementById('custom-count');
const domainInput = document.getElementById('domain-input');
const addDomainBtn = document.getElementById('add-domain-btn');
const domainError = document.getElementById('domain-error');
const domainList = document.getElementById('domain-list');
const emptyState = document.getElementById('empty-state');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const importError = document.getElementById('import-error');
const importSuccess = document.getElementById('import-success');
const versionEl = document.getElementById('version');

let customDomains = [];

// Display extension version from manifest
versionEl.textContent = chrome.runtime.getManifest().version;

/**
 * Load and render the full state.
 */
async function loadState() {
  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  customDomains = state.customDomains || [];

  const storage = await chrome.storage.local.get([
    STORAGE_KEYS.ENABLED,
    STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION,
    STORAGE_KEYS.STATS,
  ]);

  const enabled = storage[STORAGE_KEYS.ENABLED] ?? true;
  const requiresConfirmation = storage[STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION] ?? true;
  const stats = storage[STORAGE_KEYS.STATS] || { totalBlocked: 0, lastBlockedAt: null };

  enabledToggle.checked = enabled;
  confirmToggle.checked = requiresConfirmation;

  updateStatusBadge(enabled);

  totalBlockedEl.textContent = stats.totalBlocked.toLocaleString();
  lastBlockedEl.textContent = stats.lastBlockedAt
    ? new Date(stats.lastBlockedAt).toLocaleDateString()
    : 'Never';
  defaultCountEl.textContent = DEFAULT_DOMAINS.length.toLocaleString();
  customCountEl.textContent = customDomains.length.toLocaleString();

  renderDomainList();
}

function updateStatusBadge(enabled) {
  if (enabled) {
    statusBadge.textContent = 'Active';
    statusBadge.className = 'status active';
  } else {
    statusBadge.textContent = 'Disabled';
    statusBadge.className = 'status disabled';
  }
}

/**
 * Render the custom domain list.
 */
function renderDomainList() {
  // Remove all domain items but keep the empty state element
  domainList.querySelectorAll('.domain-item').forEach((el) => el.remove());

  if (customDomains.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  for (const domain of customDomains) {
    const item = document.createElement('div');
    item.className = 'domain-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = domain;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => removeDomain(domain));

    item.appendChild(nameSpan);
    item.appendChild(removeBtn);
    domainList.appendChild(item);
  }
}

function showError(el, message) {
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function showSuccess(el, message) {
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

// --- Event Handlers ---

enabledToggle.addEventListener('change', async () => {
  const response = await chrome.runtime.sendMessage({
    type: 'SET_ENABLED',
    value: enabledToggle.checked,
  });
  updateStatusBadge(response.enabled);
});

confirmToggle.addEventListener('change', async () => {
  await chrome.storage.local.set({
    [STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION]: confirmToggle.checked,
  });
});

async function addDomain() {
  const raw = domainInput.value.trim();
  if (!raw) return;

  const normalized = normalizeDomain(raw);
  if (!normalized || !isValidDomain(raw)) {
    showError(domainError, `"${raw}" is not a valid domain.`);
    return;
  }

  if (customDomains.includes(normalized)) {
    showError(domainError, `"${normalized}" is already in your list.`);
    return;
  }

  if (DEFAULT_DOMAINS.includes(normalized)) {
    showError(domainError, `"${normalized}" is already in the default blocklist.`);
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: 'ADD_CUSTOM_DOMAINS',
    domains: [normalized],
  });

  customDomains = response.customDomains;
  customCountEl.textContent = customDomains.length.toLocaleString();
  domainInput.value = '';
  domainError.classList.add('hidden');
  renderDomainList();
}

addDomainBtn.addEventListener('click', addDomain);

domainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addDomain();
});

async function removeDomain(domain) {
  const response = await chrome.runtime.sendMessage({
    type: 'REMOVE_CUSTOM_DOMAIN',
    domain,
  });
  customDomains = response.customDomains;
  customCountEl.textContent = customDomains.length.toLocaleString();
  renderDomainList();
}

// Export as JSON file download
exportBtn.addEventListener('click', () => {
  const data = JSON.stringify({ customDomains }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'betblock-domains.json';
  link.click();

  URL.revokeObjectURL(url);
});

// Import from JSON file
importBtn.addEventListener('click', () => {
  importFile.click();
});

importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  importError.classList.add('hidden');
  importSuccess.classList.add('hidden');

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.customDomains || !Array.isArray(data.customDomains)) {
      showError(importError, 'Invalid file format. Expected { "customDomains": [...] }');
      return;
    }

    const valid = data.customDomains.filter((d) => {
      const n = normalizeDomain(d);
      return n && isValidDomain(d);
    });

    if (valid.length === 0) {
      showError(importError, 'No valid domains found in the file.');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'ADD_CUSTOM_DOMAINS',
      domains: valid,
    });

    customDomains = response.customDomains;
    customCountEl.textContent = customDomains.length.toLocaleString();
    renderDomainList();

    showSuccess(importSuccess, `Imported ${valid.length} domain(s).`);
  } catch {
    showError(importError, 'Failed to read file. Make sure it is valid JSON.');
  }

  // Reset file input so the same file can be re-imported
  importFile.value = '';
});

loadState();
