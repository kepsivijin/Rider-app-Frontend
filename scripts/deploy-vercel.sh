#!/usr/bin/env bash
# Deploy frontend to Vercel (requires VERCEL_TOKEN in environment).
set -euo pipefail

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Set VERCEL_TOKEN first (Vercel → Account Settings → Tokens)"
  exit 1
fi

API_URL="${VITE_API_URL:-https://rider-app-api.onrender.com/api/v1}"
WS_URL="${VITE_WS_URL:-https://rider-app-api.onrender.com}"

cd "$(dirname "$0")/.."

export VERCEL_TOKEN
npx vercel deploy --prod --yes \
  --name rider-app-frontend \
  --env "VITE_API_URL=${API_URL}" \
  --env "VITE_WS_URL=${WS_URL}" \
  --env "VITE_GOOGLE_MAPS_API_KEY="

echo "Frontend deployed. Update Render ALLOWED_ORIGINS with the Vercel URL."
