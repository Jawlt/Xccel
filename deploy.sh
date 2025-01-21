#!/bin/bash
# Remove old files
rm -rf chrome-extension/static chrome-extension/asset-manifest.json chrome-extension/index.html

# Copy new files from the build folder
cp -r react-frontend/build/static chrome-extension/
cp react-frontend/build/asset-manifest.json chrome-extension/
cp react-frontend/build/index.html chrome-extension/
