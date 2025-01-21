#!/bin/bash

# Define the paths to the frontend and backend environment example files
FRONTEND_ENV_SOURCE="react-frontend/.env.example"
FRONTEND_ENV_TARGET="react-frontend/.env"

BACKEND_ENV_SOURCE="backend/.env.example"
BACKEND_ENV_TARGET="backend/.env"

# Function to copy environment files
copy_env_file() {
  local source=$1
  local target=$2

  if [ -f "$source" ]; then
    cp "$source" "$target"
    echo "Copied $source to $target"
  else
    echo "Error: $source not found!"
    exit 1
  fi
}

# Copy frontend environment file
copy_env_file "$FRONTEND_ENV_SOURCE" "$FRONTEND_ENV_TARGET"

# Copy backend environment file
copy_env_file "$BACKEND_ENV_SOURCE" "$BACKEND_ENV_TARGET"

echo "Environment setup complete. Please fill in the .env files with your credentials."
