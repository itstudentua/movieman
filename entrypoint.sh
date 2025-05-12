#!/bin/sh

echo "⏳ Wait for PostgreSQL..."
while ! nc -z db 5432; do
    sleep 1
done

echo "🚀 Apply Prisma migrations..."
npx prisma migrate deploy

echo "✅ Start Application..."
npm start
