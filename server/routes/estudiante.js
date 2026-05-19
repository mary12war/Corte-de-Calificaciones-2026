/**
 * Rutas API para consulta y carga de datos de estudiantes.
 */

const express = require('express');
const multer = require('multer');
const {
  normalizarId,
  parsearBuffer,
  crearIndice,
  estudiantePublico,
  MAX_FILE_SIZE_BYTES,
} = require('../excelLoader');

const router = express.Router();

/** Tamaño máximo de upload vía POST (5 MB) */
const MAX_UPLOAD_BYTES = MAX_FILE_SIZE_BYTES;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    const nombre = (file.originalname || '').toLowerCase();
    const esXlsx =
      nombre.endsWith('.xlsx') ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!esXlsx) {
      return cb(new Error('Solo se permiten archivos .xlsx'));
    }
    cb(null, true);
  },
});

/**
 * Obtiene referencia al almacén en memoria desde la app.
 * @param {import('express').Request} req
 */
function getStore(req) {
  return req.app.locals.estudiantesStore;
}

/**
 * GET /api/estudiante/:id
 * Busca un estudiante por cédula/ID normalizado.
 */
router.get('/:id', (req, res) => {
  try {
    const store = getStore(req);
    const idBuscado = normalizarId(req.params.id);

    if (!idBuscado) {
      return res.status(400).json({
        encontrado: false,
        estudiante: null,
        mensaje: 'ID inválido o vacío.',
      });
    }

    const registro = store.indice.get(idBuscado);

    if (!registro) {
      return res.json({
        encontrado: false,
        estudiante: null,
      });
    }

    return res.json({
      encontrado: true,
      estudiante: estudiantePublico(registro),
    });
  } catch (err) {
    console.error('[estudiante GET]', err);
    return res.status(500).json({
      encontrado: false,
      estudiante: null,
      mensaje: 'Error interno al buscar el estudiante.',
    });
  }
});

/**
 * POST /api/upload
 * Reemplaza los datos en memoria con un nuevo archivo .xlsx (multipart campo "archivo").
 */
router.post('/upload', (req, res) => {
  upload.single('archivo')(req, res, (errMulter) => {
    if (errMulter) {
      const mensaje =
        errMulter.code === 'LIMIT_FILE_SIZE'
          ? `El archivo supera el tamaño máximo (${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`
          : errMulter.message || 'Error al procesar el archivo.';
      return res.status(400).json({ ok: false, mensaje });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe enviar un archivo en el campo "archivo" (multipart/form-data).',
      });
    }

    try {
      const lista = parsearBuffer(req.file.buffer);
      const store = getStore(req);

      store.lista = lista;
      store.indice = crearIndice(lista);
      store.cargadoEn = new Date().toISOString();
      store.total = lista.length;

      return res.json({
        ok: true,
        mensaje: 'Datos actualizados correctamente.',
        total: lista.length,
      });
    } catch (err) {
      console.error('[estudiante upload]', err);
      return res.status(400).json({
        ok: false,
        mensaje: err.message || 'No se pudo leer el archivo Excel.',
      });
    }
  });
});

module.exports = router;
