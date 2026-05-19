#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm install
VITE_API_URL=http://127.0.0.1:8000/api npm run dev -- --host 127.0.0.1
