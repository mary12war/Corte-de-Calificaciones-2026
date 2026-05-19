#!/usr/bin/env bash
# Arranque en desarrollo: instala dependencias si faltan e inicia el servidor.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -d "node_modules" ]; then
  echo "[start.sh] Instalando dependencias (npm install)..."
  npm install
fi

if [ ! -f "data/CORTEPRIMERSEMESTRE2026.xlsx" ]; then
  echo "[start.sh] Generando Excel de ejemplo..."
  npm run generate-sample
fi

echo "[start.sh] Iniciando servidor en http://localhost:${PORT:-3000}"
if command -v nodemon >/dev/null 2>&1 || [ -f "node_modules/.bin/nodemon" ]; then
  npm run dev
else
  npm start
fi
