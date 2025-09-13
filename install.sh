#!/bin/bash

echo "========================================"
echo "Suraksha Blood Donation Platform Setup"
echo "========================================"
echo

# Check if Node.js is installed
echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

echo "Node.js is installed: $(node --version)"
echo

# Check if npm is installed
echo "Checking if npm is installed..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo "npm is installed: $(npm --version)"
echo

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo
echo "========================================"
echo "Installation completed successfully!"
echo "========================================"
echo
echo "To start the application:"
echo "1. Run: npm start"
echo "2. Open your browser and go to: http://localhost:3000"
echo
echo "For development mode with auto-restart:"
echo "Run: npm run dev"
echo
