#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"

if [ ! -f ".venv/bin/activate" ]; then
  python3 -m venv --clear .venv
fi

source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

export DATABASE_URL="${DATABASE_URL:-sqlite:///./edms.db}"
export STORAGE_DIR="${STORAGE_DIR:-storage}"

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
