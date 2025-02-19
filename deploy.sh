#!/bin/bash

# Change directory to react-frontend and build the project
cd react-frontend 
npm run build
cd ..

# Remove old files
rm -rf chrome-extension/static chrome-extension/asset-manifest.json chrome-extension/index.html

# Copy new files from the build folder
cp -r react-frontend/build/static chrome-extension/
cp react-frontend/build/asset-manifest.json chrome-extension/
cp react-frontend/build/index.html chrome-extension/
