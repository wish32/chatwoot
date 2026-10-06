#!/bin/sh
# Rails + Vite in one container so the dev-server check hits localhost,
# while Vite binds 0.0.0.0 so the published port works from the Windows host.
set -eu

cd /app

# Install into the mounted volume. Copying pnpm's symlink tree out of the
# image breaks the .pnpm links, so a broken vite is treated as not installed.
if ! node_modules/.bin/vite --version >/dev/null 2>&1; then
  echo "Installing node dependencies..."
  find node_modules -mindepth 1 -delete 2>/dev/null || true
  HUSKY=0 CI=1 pnpm install --frozen-lockfile --ignore-scripts
fi

if [ ! -f public/packs/js/sdk.js ]; then
  echo "Building website widget SDK..."
  pnpm build:sdk
fi

# Vite runs on the Windows host. Rails only needs a local port to notice it;
# the browser loads http://localhost:3036 directly (allowed on https://take.com).
ruby -e 'require "socket"; s=TCPServer.new("127.0.0.1",3036); loop { c=s.accept; Thread.new(c) { begin u=TCPSocket.new("host.docker.internal",3036); t=Thread.new { IO.copy_stream(u,c) rescue nil }; IO.copy_stream(c,u) rescue nil; t.join; ensure; c.close rescue nil; end } }' &

exec bundle exec rails s -p 3000 -b 0.0.0.0
