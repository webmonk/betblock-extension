# BetBlock

A Chrome extension that blocks access to gambling websites. All data stays local — nothing is sent externally.

## Features

- Blocks 140+ known gambling domains out of the box
- Add/remove custom domains to block
- Redirect blocked pages to a clear explanation page
- Quick enable/disable toggle with optional confirmation safeguard
- Import/export custom domain lists as JSON
- Block statistics tracking
- Clean, dark-themed UI
- No external dependencies, no network calls, no tracking

## How It Works

BetBlock uses Chrome's [Declarative Net Request](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest) API to intercept navigation to gambling websites and redirect them to a local blocked page. Rules are evaluated by Chrome's network stack directly, so blocking works even when the extension's service worker is inactive.

## Project Structure

```
betblock-extension/
├── manifest.json              # Chrome extension manifest (V3)
├── src/
│   ├── background/
│   │   ├── service-worker.js  # Extension lifecycle and message routing
│   │   └── rules.js           # DNR rule management
│   ├── blocklist/
│   │   └── default-domains.js # Default gambling domain list
│   ├── storage/
│   │   └── storage.js         # chrome.storage.local wrapper
│   ├── pages/
│   │   ├── blocked/           # "Site blocked" redirect page
│   │   └── options/           # Full settings page
│   ├── popup/                 # Browser action popup (quick toggle)
│   └── shared/
│       ├── constants.js       # Shared constants and config
│       └── domain-utils.js    # Domain validation and normalization
├── icons/                     # Extension icons (16, 48, 128px)
├── tests/                     # Unit tests
├── scripts/                   # Build/packaging scripts
└── package.json               # Node.js config (for tests only)
```

## Setup for Development

### Prerequisites

- Google Chrome (or Chromium-based browser)
- Node.js 18+ (for running tests only)

### Load the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `betblock-extension` root directory
5. The extension icon should appear in your toolbar

### Running Tests

```bash
node tests/run-tests.js
```

Or via npm:

```bash
npm test
```

## Usage

### Quick Toggle
Click the BetBlock icon in the toolbar to see the popup. From there you can:
- See whether blocking is active
- View total blocks count
- Enable or disable blocking (with optional confirmation)
- Open the full settings page

### Settings Page
Right-click the extension icon → **Options**, or click "Settings" in the popup. From settings you can:
- Toggle blocking on/off
- Toggle the disable confirmation safeguard
- View blocking statistics
- Add or remove custom domains
- Import/export your custom domain list as JSON

### Blocked Page
When you try to visit a blocked gambling site, you'll be redirected to a page explaining that the site was blocked. This page links to the settings for domain management.

## Packaging for Chrome Web Store

```bash
bash scripts/package.sh
```

This creates `betblock-extension.zip` in the project root, containing only the files Chrome needs.

## Limitations

- **Not a parental control.** Users can disable or uninstall the extension from `chrome://extensions`. Only enterprise policies or OS-level tools can prevent this.
- **Incognito mode.** The extension must be explicitly enabled for incognito by the user in `chrome://extensions`.
- **IP-based navigation.** If a user navigates to a gambling site by IP address, the domain-based rules won't match.
- **Dynamic rule limit.** Chrome limits dynamic rules to 5,000. With one rule per domain, this is the combined ceiling for default + custom domains.
- **No cross-browser support.** This build targets Chrome/Chromium only. The architecture is designed to make Firefox porting feasible.

## Privacy

- No data is collected or transmitted
- No analytics or telemetry
- No content scripts injected into any page
- All storage is local to the browser via `chrome.storage.local`
- The only permissions used are `declarativeNetRequest` and `storage`

## License

MIT
