#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")/.."
if [ -f .env.local ]; then
  echo ".env.local already exists; leaving it unchanged."
else
  cp .env.example .env.local
  echo "Created .env.local from .env.example."
  echo "Edit .env.local and add values from the EXISTING JEMBEE PLAY Firebase Web app."
fi
