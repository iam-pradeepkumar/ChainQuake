#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "📦 Installing Backend Dependencies..."
pip install -r requirements.txt

echo "⚙️ Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

echo "🏗️ Building Tactical Dashboard (Frontend)..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build Complete!"
