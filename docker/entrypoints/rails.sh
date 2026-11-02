#!/bin/sh

set -x

# Remove a potentially pre-existing server.pid for Rails.
rm -rf /app/tmp/pids/server.pid
# Wiping tmp/cache drops the Bootsnap index. On the Windows bind mount that
# makes the next boot and the first page take minutes.
if [ "$HKSS_DOCKER_DEV" != "true" ]; then
  rm -rf /app/tmp/cache/*
fi

echo "Waiting for postgres to become ready...."

# Let DATABASE_URL env take presedence over individual connection params.
# This is done to avoid printing the DATABASE_URL in the logs
$(docker/entrypoints/helpers/pg_database_url.rb)
PG_READY="pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USERNAME"

until $PG_READY
do
  sleep 2;
done

echo "Database ready to accept connections."

# The image already has the gems. Installing again on every boot only repeats
# the resolve work; install when the lockfile actually changed.
if ! bundle check; then
  bundle install || exit 1
fi

# Editors on Windows keep saving these scripts with CRLF. `set -eu` then
# exits before Rails starts. Strip the carriage return at run time.
if [ "$1" = "sh" ] && [ -f "$2" ]; then
  exec sh -c 'tr -d "$(printf "\r")" < "$1" | sh' sh "$2"
fi

exec "$@"
