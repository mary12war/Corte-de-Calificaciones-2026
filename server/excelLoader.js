/**
 * Carga y normaliza datos de estudiantes desde un archivo Excel (.xlsx).
 * Los datos se mantienen en memoria como arreglo de objetos JSON.
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/** Tamaño máximo permitido al leer el archivo desde disco (5 MB) */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Columnas obligatorias en el Excel (encabezados exactos) */
const COLUMNAS_REQUERIDAS = [
  'ID',
  'Nombre',
  'Apellido',
  'Turno',
  'Grupo',
  'Ingles',
  'Informatica',
  'Valores',
  'Ausencias',
  'Tardanzas',
  'Cuota',
];

/** Mapa de columna Excel -> clave en el objeto estudiante de la API */
const MAPA_COLUMNAS = {
  ID: 'ID',
  Nombre: 'Nombre',
  Apellido: 'Apellido',
  Turno: 'Turno',
  Grupo: 'Grupo',
  'Ingles': 'Ingles',
  'Informatica': 'Informatica',
  Valores: 'Valores',
  Ausencias: 'Ausencias',
  Tardanzas: 'Tardanzas',
  Cuota: 'Cuota',
};

/**
 * Normaliza un ID para comparación: trim, minúsculas, sin guiones ni espacios.
 * @param {string|number} id
 * @returns {string}
 */
function normalizarId(id) {
  if (id === null || id === undefined) return '';
  return String(id)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]/g, '');
}

/**
 * Convierte un valor de celda a string legible; vacíos quedan como cadena vacía.
 * @param {*} valor
 * @returns {string}
 */
function valorACadena(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'number' && !Number.isNaN(valor)) {
    return Number.isInteger(valor) ? String(valor) : String(valor);
  }
  return String(valor).trim();
}

/**
 * Valida que el buffer corresponda a un archivo .xlsx (ZIP con firma PK).
 * @param {Buffer} buffer
 * @returns {boolean}
 */
function esBufferXlsx(buffer) {
  if (!buffer || buffer.length < 4) return false;
  return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

/**
 * Parsea un buffer .xlsx y devuelve el arreglo de estudiantes normalizado.
 * @param {Buffer} buffer
 * @returns {Array<Object>}
 */
function parsearBuffer(buffer) {
  if (!esBufferXlsx(buffer)) {
    throw new Error('El archivo no es un Excel válido (.xlsx).');
  }

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const nombreHoja = workbook.SheetNames[0];
  if (!nombreHoja) {
    throw new Error('El archivo Excel no contiene hojas.');
  }

  const hoja = workbook.Sheets[nombreHoja];
  const filas = XLSX.utils.sheet_to_json(hoja, { defval: '', raw: false });

  if (!filas.length) {
    throw new Error('El archivo Excel no contiene filas de datos.');
  }

  const encabezados = Object.keys(filas[0]);
  const faltantes = COLUMNAS_REQUERIDAS.filter((col) => !encabezados.includes(col));
  if (faltantes.length) {
    throw new Error(
      `Faltan columnas obligatorias en el Excel: ${faltantes.join(', ')}`
    );
  }

  const estudiantes = [];
  const idsVistos = new Set();

  for (const fila of filas) {
    const idRaw = valorACadena(fila.ID);
    if (!idRaw) continue;

    const estudiante = {};
    for (const [colExcel, claveApi] of Object.entries(MAPA_COLUMNAS)) {
      estudiante[claveApi] = valorACadena(fila[colExcel]);
    }

    const idNorm = normalizarId(estudiante.ID);
    if (idsVistos.has(idNorm)) {
      console.warn(`[excelLoader] ID duplicado ignorado: ${estudiante.ID}`);
      continue;
    }
    idsVistos.add(idNorm);
    estudiante._idNormalizado = idNorm;
    estudiantes.push(estudiante);
  }

  if (!estudiantes.length) {
    throw new Error('No se encontraron estudiantes con ID válido en el archivo.');
  }

  return estudiantes;
}

/**
 * Lee el archivo Excel desde disco con validación de tamaño.
 * @param {string} rutaArchivo - Ruta absoluta al .xlsx
 * @returns {Array<Object>}
 */
function cargarDesdeArchivo(rutaArchivo) {
  const rutaAbsoluta = path.resolve(rutaArchivo);

  if (!fs.existsSync(rutaAbsoluta)) {
    throw new Error(`No se encontró el archivo de datos. Coloque un .xlsx en la carpeta /data.`);
  }

  const stats = fs.statSync(rutaAbsoluta);
  if (stats.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `El archivo supera el tamaño máximo permitido (${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB).`
    );
  }

  const buffer = fs.readFileSync(rutaAbsoluta);
  return parsearBuffer(buffer);
}

/**
 * Crea un índice Map por ID normalizado para búsquedas O(1).
 * @param {Array<Object>} estudiantes
 * @returns {Map<string, Object>}
 */
function crearIndice(estudiantes) {
  const indice = new Map();
  for (const est of estudiantes) {
    indice.set(est._idNormalizado, est);
  }
  return indice;
}

/**
 * Devuelve una copia del estudiante sin campos internos.
 * @param {Object} estudiante
 * @returns {Object}
 */
function estudiantePublico(estudiante) {
  const { _idNormalizado, ...publico } = estudiante;
  return publico;
}

module.exports = {
  COLUMNAS_REQUERIDAS,
  MAX_FILE_SIZE_BYTES,
  normalizarId,
  parsearBuffer,
  cargarDesdeArchivo,
  crearIndice,
  estudiantePublico,
};
