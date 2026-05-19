/**
 * Exporta estudiantes del Excel a js/estudiantes.json para GitHub Pages (búsqueda en el navegador).
 * Ejecutar: npm run build-data
 */

const fs = require('fs');
const path = require('path');
const {
  cargarDesdeArchivo,
  normalizarId,
  estudiantePublico,
} = require('../server/excelLoader');

const DATA_FILE = path.join(__dirname, '..', 'data', 'CORTEPRIMERSEMESTRE2026.xlsx');
const OUT_FILE = path.join(__dirname, '..', 'js', 'estudiantes.json');

const lista = cargarDesdeArchivo(DATA_FILE);
const indice = {};

for (const est of lista) {
  const clave = est._idNormalizado || normalizarId(est.ID);
  if (clave) indice[clave] = estudiantePublico(est);
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(indice), 'utf8');

console.log(`[build-data] ${Object.keys(indice).length} estudiante(s) → ${OUT_FILE}`);
