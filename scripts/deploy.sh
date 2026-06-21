#!/usr/bin/env bash
# Deploy Maritare on the VPS: pull (or build) the image, run DB migrations, then
# (re)start the stack. Invoked by GitHub Actions over SSH on merge to main, and
# safe to run by hand. Idempotent.
#
#   WEB_IMAGE=ghcr.io/<owner>/<repo>:<tag>   # registry image to deploy
#   BUILD_LOCALLY=1                          # build on the VPS instead of pulling
#
# Run from anywhere; it cd's to the repo root (the dir holding this script's ..).
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

COMPOSE="docker compose -f docker-compose.prod.yml"

if [ ! -f .env ]; then
  echo "deploy: .env not found in $(pwd) — create it first (see DEPLOY.md)" >&2
  exit 1
fi

if [ "${BUILD_LOCALLY:-0}" = "1" ]; then
  echo "deploy: building image on the VPS…"
  $COMPOSE build
else
  echo "deploy: pulling ${WEB_IMAGE:-<compose default>}…"
  $COMPOSE pull web
fi

# Apply migrations first; a failure aborts the deploy before the web container is
# swapped, so a bad migration never takes the site down.
echo "deploy: applying migrations…"
$COMPOSE run --rm migrate

echo "deploy: starting services…"
$COMPOSE up -d --remove-orphans postgres redis web

# Reclaim space from superseded images.
docker image prune -f >/dev/null 2>&1 || true

echo "deploy: done."
$COMPOSE ps
