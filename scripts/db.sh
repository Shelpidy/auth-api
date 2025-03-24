#!/bin/sh
set -e

echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL started"

echo "Pushing schema changes..."
npm run push || {
  echo "Schema push failed, but continuing..."
}

echo "Seeding database..."
npm run seed || {
  echo "Seeding failed (possibly due to existing data), continuing..."
}

echo "Database initialization completed!"