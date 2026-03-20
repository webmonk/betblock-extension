#!/usr/bin/env bash
#
# Package the extension into a zip file suitable for Chrome Web Store upload.
# Output: betblock-extension.zip in the project root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT="$PROJECT_ROOT/betblock-extension.zip"

cd "$PROJECT_ROOT"

# Remove old package if it exists
rm -f "$OUTPUT"

# Zip only the files Chrome needs (exclude tests, scripts, node config)
zip -r "$OUTPUT" \
  manifest.json \
  src/ \
  icons/ \
  -x "*.test.js" \
  -x "*/node_modules/*"

echo ""
echo "Packaged: $OUTPUT"
echo "Size: $(du -h "$OUTPUT" | cut -f1)"
