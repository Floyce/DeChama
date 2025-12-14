#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
cd ~/DeChama/client
echo "Running build..."
npm run build
