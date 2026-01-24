#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo "  Fit4Life - Dev server (Vite)"
echo "=========================================="
echo ""

# Install dependencies if Vite is not available
if [ ! -f "node_modules/.bin/vite" ]; then
  echo "Installing dependencies (one-time, 1–2 min)..."
  npm install
  if [ $? -ne 0 ]; then
    echo ""
    echo "npm install failed. In Terminal run:"
    echo "  cd $(pwd) && npm install && npm run dev"
    echo ""
    read -p "Press Enter to close..."
    exit 1
  fi
  echo ""
fi

echo "Starting Vite dev server..."
echo "  >>> Open in Safari the URL Vite prints below (e.g. http://localhost:3000 or :3001)"
echo "  >>> Press Ctrl+C to stop"
echo "=========================================="
npm run dev
