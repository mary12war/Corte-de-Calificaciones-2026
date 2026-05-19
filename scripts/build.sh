#!/usr/bin/env bash
# Verificación previa al despliegue (no hay compilación de frontend).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "[build.sh] Instalando dependencias de producción..."
npm ci --omit=dev 2>/dev/null || npm install --omit=dev

if [ ! -f "data/CORTEPRIMERSEMESTRE2026.xlsx" ]; then
  echo "[build.sh] Generando Excel de ejemplo..."
  npm run generate-sample
fi

echo "[build.sh] Verificando carga del Excel..."
node -e "
const { cargarDesdeArchivo } = require('./server/excelLoader');
const path = require('path');
const lista = cargarDesdeArchivo(path.join('data', 'CORTEPRIMERSEMESTRE2026.xlsx'));
console.log('[build.sh] OK:', lista.length, 'estudiante(s) listos.');
"

echo "[build.sh] Listo. Ejecute: npm start"
