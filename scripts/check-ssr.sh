#!/usr/bin/env bash
# Check your own app in 10 seconds: is a lazy section's content in the HTML the server sends?
# Usage: scripts/check-ssr.sh <url> "<text that only appears inside a lazy section>"
# Scripts are stripped first: SvelteKit serializes page data into a <script>,
# so the text can appear there even when the section itself was not rendered.
curl -s "$1" | perl -0pe 's/<script.*?<\/script>//gs' | grep -c "$2" | sed 's/^/rendered matches: /'
