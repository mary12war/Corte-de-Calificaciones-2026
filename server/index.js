/**
 * Servidor Express: API de estudiantes + cliente estático.
 * Los datos se cargan desde /data al arrancar y NO se expone la ruta del Excel.
 */

const path = require('path');
const express = require('express');
const { cargarDesdeArchivo, crearIndice } = require('./excelLoader');
const estudianteRoutes = require('./routes/estudiante');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'CORTEPRIMERSEMESTRE2026.xlsx');
const CLIENT_DIR = path.join(__dirname, '..', 'client');

const app = express();

app.use(express.json({ limit: '100kb' }));

/** Almacén en memoria (misma referencia para rutas y arranque) */
const estudiantesStore = {
  lista: [],
  indice: new Map(),
  cargadoEn: null,
  total: 0,
};

app.locals.estudiantesStore = estudiantesStore;

/**
 * Carga inicial del Excel desde /data
 */
function inicializarDatos() {
  console.log('[servidor] Cargando datos de estudiantes...');
  const lista = cargarDesdeArchivo(DATA_FILE);
  estudiantesStore.lista = lista;
  estudiantesStore.indice = crearIndice(lista);
  estudiantesStore.cargadoEn = new Date().toISOString();
  estudiantesStore.total = lista.length;
  console.log(`[servidor] ${lista.length} estudiante(s) cargado(s) en memoria.`);
}

// API
app.use('/api/estudiante', estudianteRoutes);

// Cliente estático (no servir /data)
app.use(express.static(CLIENT_DIR, { index: 'index.html' }));

// Fallback para rutas del cliente
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

// Manejo de errores global
app.use((err, _req, res, _next) => {
  console.error('[servidor] Error:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

try {
  inicializarDatos();

  const servidor = app.listen(PORT, () => {
    console.log(`[servidor] Escuchando en http://localhost:${PORT}`);
    console.log('[servidor] Abra el navegador para consultar estudiantes por ID.');
  });

  servidor.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[servidor] El puerto ${PORT} ya está en uso. Cierre la otra instancia o use otro puerto:`
      );
      console.error(`  PowerShell: $env:PORT=3001; npm start`);
      process.exit(1);
    }
    throw err;
  });
} catch (err) {
  console.error('[servidor] No se pudo iniciar:', err.message);
  console.error(
    '[servidor] Ejecute "npm run generate-sample" o coloque CORTEPRIMERSEMESTRE2026.xlsx en /data'
  );
  process.exit(1);
}
