#!/usr/bin/env bash
set -euo pipefail

SITE_NAME="${NETLIFY_SITE_NAME:-study-by-dark-phoenix}"

echo "Building project..."
npm run build
npm run build:netlify-function

echo "Ensuring Netlify site exists: $SITE_NAME"
if [ ! -f .netlify/state.json ] || [ -z "$(jq -r '.siteId // empty' .netlify/state.json 2>/dev/null || true)" ]; then
  echo "Creating/linking Netlify site..."
  npx netlify sites:create --name "$SITE_NAME" || true
  # If the name is taken, try to link by name
  npx netlify link --name "$SITE_NAME" || true
fi

echo "Deploying to Netlify..."
npx netlify deploy --prod --dir=dist/public --functions=.netlify/functions
