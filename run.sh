#!/bin/bash
cd "$(dirname "$0")"

# Install dependencies if Vite is not available
if [ ! -f "node_modules/.bin/vite" ]; then
  echo "Installing dependencies (one-time, 1–2 min)..."
  npm install
  if [ $? -ne 0 ]; then
    echo "npm install failed. Run: npm install && npm run dev"
    exit 1
  fi
fi

echo "Starting Fit4Life (Vite dev server)..."
npm run dev
