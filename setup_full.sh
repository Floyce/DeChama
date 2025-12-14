#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

nvm install 20
nvm alias default 20
nvm use 20

mkdir -p ~/DeChama/client ~/DeChama/server

echo "Setting up Client..."
cd ~/DeChama/client
if [ ! -f package.json ]; then
    npm create vite@latest . -- --template react-ts
    npm install
    npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion react-icons
fi

echo "Setting up Server..."
cd ~/DeChama/server
if [ ! -f package.json ]; then
    npm init -y
    npm install express cors dotenv pg axios
    npm install -D typescript ts-node @types/node @types/express @types/cors @types/pg nodemon
    npx tsc --init
fi
