#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

cd "$ROOT_DIR"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 32 | tr -d '\n'
  else
    date +%s | sha256sum | awk '{print $1}'
  fi
}

write_env_if_missing() {
  if [ -f "$ENV_FILE" ]; then
    echo ".env already exists; leaving it unchanged."
    return 1
  fi

  POSTGRES_PASSWORD="$(random_secret)"
  BETTER_AUTH_SECRET="$(random_secret)"
  BOT_API_TOKEN="$(random_secret)"
  BOT_CALLBACK_SECRET="$(random_secret)"

  cat > "$ENV_FILE" <<EOF
POSTGRES_DB=rolvise
POSTGRES_USER=rolvise
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_PORT=5432
APP_PORT=3000

DATABASE_URL=postgres://rolvise:$POSTGRES_PASSWORD@postgres:5432/rolvise
LOCAL_DATABASE_URL=postgres://rolvise:$POSTGRES_PASSWORD@127.0.0.1:5432/rolvise

BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
BETTER_AUTH_URL=http://localhost:3000

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord

ROLVISE_BOT_API_TOKEN=$BOT_API_TOKEN
ROLVISE_BOT_CALLBACK_SECRET=$BOT_CALLBACK_SECRET

NEXT_PUBLIC_SENTRY_DISABLED=true
EOF

  echo "Created .env with generated database/auth/bot secrets."
  echo "Edit .env and set BETTER_AUTH_URL plus Discord credentials before production use."
  return 0
}

env_value() {
  grep "^$1=" "$ENV_FILE" | tail -n 1 | cut -d '=' -f2-
}

require_env_value() {
  VALUE="$(env_value "$1")"

  if [ -z "$VALUE" ]; then
    echo "Missing required .env value: $1" >&2
    return 1
  fi

  return 0
}

need_command docker

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required: docker compose" >&2
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "Installing Bun for local migration/build commands..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

need_command bun

if write_env_if_missing; then
  echo "Fill DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, BETTER_AUTH_URL, and DISCORD_REDIRECT_URI in .env, then run this script again."
  exit 0
fi

require_env_value POSTGRES_PASSWORD
require_env_value DATABASE_URL
require_env_value LOCAL_DATABASE_URL
require_env_value BETTER_AUTH_SECRET
require_env_value BETTER_AUTH_URL
require_env_value DISCORD_CLIENT_ID
require_env_value DISCORD_CLIENT_SECRET
require_env_value DISCORD_REDIRECT_URI
require_env_value ROLVISE_BOT_API_TOKEN
require_env_value ROLVISE_BOT_CALLBACK_SECRET

echo "Installing dependencies..."
bun install --frozen-lockfile

echo "Starting Postgres..."
docker compose --env-file "$ENV_FILE" up -d postgres

echo "Waiting for Postgres health check..."
until docker compose --env-file "$ENV_FILE" ps postgres | grep -q "healthy"; do
  sleep 2
done

echo "Running Drizzle migrations..."
DATABASE_URL="$(grep '^LOCAL_DATABASE_URL=' "$ENV_FILE" | cut -d '=' -f2-)" bun run db:migrate

echo "Building and starting the app container..."
docker compose --env-file "$ENV_FILE" up -d --build app

echo "Done. App should be reachable on APP_PORT from .env."
