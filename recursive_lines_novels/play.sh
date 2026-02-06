#!/bin/bash

# RECURSIVE LINES
# Terminal entry point

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Install with: brew install node"
    exit 1
fi

# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if dependencies installed
if [ ! -d "$DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$DIR"
    npm install
fi

# Run
node "$DIR/cli/engine.js"
