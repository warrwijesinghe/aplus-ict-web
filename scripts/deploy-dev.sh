#!/usr/bin/env bash

set -Eeuo pipefail

WEB_DIR="/srv/aplus-ict/aplus-ict-web"
INFRA_DIR="/srv/aplus-ict/aplus-ict-infra"
COMPOSE_FILE="$INFRA_DIR/compose.yaml"
SERVICE_NAME="web"
LOCK_FILE="/tmp/aplus-ict-web-deploy.lock"

exec 9>"$LOCK_FILE"

if ! flock -n 9; then
  echo "Another A Plus ICT web deployment is already running."
  exit 1
fi

echo "Updating A Plus ICT web..."

git -C "$WEB_DIR" fetch origin dev
git -C "$WEB_DIR" switch dev
git -C "$WEB_DIR" reset --hard origin/dev

echo "Building A Plus ICT web..."

cd "$INFRA_DIR"

docker compose -f "$COMPOSE_FILE" config --quiet
docker compose -f "$COMPOSE_FILE" build "$SERVICE_NAME"
docker compose -f "$COMPOSE_FILE" up -d --no-deps "$SERVICE_NAME"

echo "Web service status:"
docker compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME"

if ! docker compose -f "$COMPOSE_FILE" ps --status running --services "$SERVICE_NAME" | grep -Fxq "$SERVICE_NAME"; then
  echo "A Plus ICT web service is not running after deployment."
  exit 1
fi

echo "A Plus ICT web deployment completed."
