#!/bin/bash
# Serves the built app from dist/ when npm run dev doesn't work.
# Open: http://localhost:3000

cd "$(dirname "$0")"

if [ ! -f "dist/index.html" ]; then
  echo "No dist/ build found. Run: npm install && npm run build"
  exit 1
fi

# Prefer Node (no deps); fallback to Python
if command -v node >/dev/null 2>&1; then
  node serve.cjs
elif command -v python3 >/dev/null 2>&1; then
  echo "Serving at http://localhost:3000 - Press Ctrl+C to stop"
  python3 -m http.server 3000 --directory dist
else
  echo "Need Node or Python to serve. Install Node from https://nodejs.org"
  exit 1
fi
