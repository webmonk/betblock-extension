/**
 * Popup script — quick toggle and status display.
 */

import { DISABLE_CONFIRMATION_PHRASE, STORAGE_KEYS } from '../shared/constants.js';
import { DEFAULT_DOMAINS } from '../blocklist/default-domains.js';

const statusBadge = document.getElementById('status-badge');
const blockCount = document.getElementById('block-count');
const domainCount = document.getElementById('domain-count');
const toggleBtn = document.getElementById('toggle-btn');
const toggleIcon = document.getElementById('toggle-icon');
const toggleText = document.getElementById('toggle-text');
const confirmSection = document.getElementById('confirm-section');
const confirmInput = document.getElementById('confirm-input');
const confirmBtn = document.getElementById('confirm-btn');
const cancelBtn = document.getElementById('cancel-btn');
const optionsLink = document.getElementById('options-link');

const SHIELD_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/><line x1="4" y1="4" x2="20" y2="20"/></svg>`;
const CHECK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/><path d="M9 12l2 2 4-4"/></svg>`;

let isEnabled = true;
let requiresConfirmation = true;

function render() {
  if (isEnabled) {
    statusBadge.textContent = 'Active';
    statusBadge.className = 'status active';
    toggleIcon.innerHTML = SHIELD_ICON;
    toggleText.textContent = 'Disable Blocking';
    toggleBtn.className = 'btn btn-toggle';
  } else {
    statusBadge.textContent = 'Disabled';
    statusBadge.className = 'status disabled';
    toggleIcon.innerHTML = CHECK_ICON;
    toggleText.textContent = 'Enable Blocking';
    toggleBtn.className = 'btn btn-toggle enable';
  }

  confirmSection.classList.add('hidden');
  confirmInput.value = '';
  confirmBtn.disabled = true;
}

async function loadState() {
  const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
  isEnabled = response.enabled;

  const storage = await chrome.storage.local.get([
    STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION,
    STORAGE_KEYS.STATS,
  ]);

  requiresConfirmation = storage[STORAGE_KEYS.DISABLE_REQUIRES_CONFIRMATION] ?? true;

  const stats = storage[STORAGE_KEYS.STATS];
  if (stats) {
    blockCount.textContent = stats.totalBlocked.toLocaleString();
  }

  const customDomains = response.customDomains || [];
  domainCount.textContent = (DEFAULT_DOMAINS.length + customDomains.length).toLocaleString();

  render();
}

toggleBtn.addEventListener('click', async () => {
  if (isEnabled) {
    if (requiresConfirmation) {
      confirmSection.classList.remove('hidden');
      confirmInput.focus();
      return;
    }
    await setEnabled(false);
  } else {
    await setEnabled(true);
  }
});

confirmInput.addEventListener('input', () => {
  confirmBtn.disabled =
    confirmInput.value.trim().toLowerCase() !==
    DISABLE_CONFIRMATION_PHRASE.toLowerCase();
});

confirmBtn.addEventListener('click', async () => {
  if (confirmInput.value.trim().toLowerCase() === DISABLE_CONFIRMATION_PHRASE.toLowerCase()) {
    await setEnabled(false);
  }
});

cancelBtn.addEventListener('click', () => {
  confirmSection.classList.add('hidden');
  confirmInput.value = '';
  confirmBtn.disabled = true;
});

async function setEnabled(value) {
  const response = await chrome.runtime.sendMessage({
    type: 'SET_ENABLED',
    value,
  });
  isEnabled = response.enabled;
  render();
}

optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

loadState();
