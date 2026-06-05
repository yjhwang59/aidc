#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="${REMOTE_USER:-yjhwang}"
REMOTE_HOST="${REMOTE_HOST:-10.23.1.53}"
REMOTE_PATH="${REMOTE_PATH:-/home/yjhwang/aidc-work}"

ssh "${REMOTE_USER}@${REMOTE_HOST}" "cd ${REMOTE_PATH} && git pull origin main && docker compose up -d --build && docker compose ps"
