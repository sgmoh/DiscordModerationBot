#!/usr/bin/env bash
# Build script for Render deployment

# Exit on error
set -o errexit

# Install dependencies
npm ci

# Build the application
npm run build

# Log completion
echo "Build completed successfully!"