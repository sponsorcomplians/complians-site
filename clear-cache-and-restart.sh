#!/bin/bash

echo "🧹 Clearing Next.js cache and restarting..."

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "next" || true

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear npm cache (optional)
echo "Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies (optional, but recommended after schema changes)
echo "Reinstalling dependencies..."
npm install

# Clear TypeScript cache
echo "Clearing TypeScript cache..."
rm -rf .tsbuildinfo

# Start development server
echo "Starting development server..."
npm run dev 