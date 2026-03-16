/**
 * Tests for storage.js with a mock chrome.storage.local.
 */

// Mock chrome.storage.local before importing storage module
const store = {};

globalThis.chrome = {
  storage: {
    local: {
      get: async (keys) => {
        if (keys === null) return { ...store };
        if (typeof keys === 'string') keys = [keys];
        const result = {};
        for (const key of keys) {
          if (store[key] !== undefined) result[key] = store[key];
        }
        return result;
      },
      set: async (items) => {
        Object.assign(store, items);
      },
    },
  },
};

const {
  initializeStorage,
  getEnabled,
  setEnabled,
  getCustomDomains,
  setCustomDomains,
  getStats,
  incrementBlockCount,
} = await import('../src/storage/storage.js');

// Clear store before each test
function resetStore() {
  for (const key of Object.keys(store)) delete store[key];
}

test('initializeStorage sets defaults on empty store', async () => {
  resetStore();
  await initializeStorage();

  assert.equal(store.enabled, true);
  assert.deepEqual(store.customDomains, []);
  assert.equal(store.disableRequiresConfirmation, true);
  assert.ok(store.stats);
  assert.equal(store.stats.totalBlocked, 0);
});

test('initializeStorage does not overwrite existing values', async () => {
  resetStore();
  store.enabled = false;
  store.customDomains = ['test.com'];

  await initializeStorage();

  assert.equal(store.enabled, false);
  assert.deepEqual(store.customDomains, ['test.com']);
});

test('getEnabled returns stored value', async () => {
  resetStore();
  store.enabled = false;
  assert.equal(await getEnabled(), false);
});

test('setEnabled stores boolean', async () => {
  resetStore();
  await setEnabled(false);
  assert.equal(store.enabled, false);

  await setEnabled(true);
  assert.equal(store.enabled, true);
});

test('getCustomDomains returns empty array by default', async () => {
  resetStore();
  assert.deepEqual(await getCustomDomains(), []);
});

test('setCustomDomains stores array', async () => {
  resetStore();
  await setCustomDomains(['a.com', 'b.com']);
  assert.deepEqual(store.customDomains, ['a.com', 'b.com']);
});

test('setCustomDomains rejects non-array', async () => {
  resetStore();
  let threw = false;
  try {
    await setCustomDomains('not-an-array');
  } catch {
    threw = true;
  }
  assert.ok(threw);
});

test('incrementBlockCount increments total', async () => {
  resetStore();
  store.stats = { totalBlocked: 5, lastBlockedAt: null };

  await incrementBlockCount();
  assert.equal(store.stats.totalBlocked, 6);
  assert.ok(store.stats.lastBlockedAt);
});
