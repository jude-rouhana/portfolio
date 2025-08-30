#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

# Install Git LFS if available
if command -v git-lfs &> /dev/null; then
    echo "Git LFS found, pulling large files..."
    git lfs pull
else
    echo "Git LFS not available, continuing without it..."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

echo "Build completed!"
