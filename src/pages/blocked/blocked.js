/**
 * Blocked page script.
 * Reads the blocked URL from query params and displays it.
 * Notifies the background worker to increment block stats.
 */

(function () {
  const params = new URLSearchParams(window.location.search);
  const blockedUrl = params.get('url') || 'Unknown site';

  const domainEl = document.getElementById('blocked-domain');
  domainEl.textContent = blockedUrl;

  const optionsLink = document.getElementById('options-link');
  optionsLink.href = chrome.runtime.getURL('src/pages/options/options.html');

  // Record the block event
  chrome.runtime.sendMessage({ type: 'INCREMENT_BLOCK_COUNT' }).catch(() => {
    // Service worker may not be ready - non-critical, ignore
  });
})();
