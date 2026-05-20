/**
 * Cliente: búsqueda de estudiantes por ID.
 * - Local (npm start): API en el mismo servidor.
 * - GitHub Pages: datos en js/estudiantes.json (generar con npm run build-data).
 */

/** URL del API si el backend está en otro host (opcional) */
const API_BASE = (window.API_BASE_URL || '').replace(/\/$/, '');

const VACIO = '—';

/** Índice en memoria para modo estático (GitHub Pages) */
let indiceLocal = null;

const elementos = {
  form: document.getElementById('form-busqueda'),
  inputId: document.getElementById('input-id'),
  feedbackId: document.getElementById('feedback-id'),
  btnBuscar: document.getElementById('btn-buscar'),
  btnBuscarOtro: document.getElementById('btn-buscar-otro'),
  spinner: document.getElementById('spinner-buscar'),
  alertaError: document.getElementById('alerta-error'),
  noEncontrado: document.getElementById('resultado-no-encontrado'),
  tarjeta: document.getElementById('tarjeta-estudiante'),
  titulo: document.getElementById('titulo-estudiante'),
  valorId: document.getElementById('valor-id'),
  valorNombre: document.getElementById('valor-nombre'),
  valorApellido: document.getElementById('valor-apellido'),
  valorGrupo: document.getElementById('valor-grupo'),
  valorTurno: document.getElementById('valor-turno'),
  valorIngles: document.getElementById('valor-ingles'),
  valorInformatica: document.getElementById('valor-informatica'),
  valorValores: document.getElementById('valor-valores'),
  valorAusencias: document.getElementById('valor-ausencias'),
  valorTardanzas: document.getElementById('valor-tardanzas'),
  valorCuota: document.getElementById('valor-cuota'),
};

/**
 * Ruta base para assets (compatible con GitHub Pages /nombre-repo/)
 * @returns {string}
 */
function obtenerRutaBase() {
  const path = window.location.pathname;
  if (path.endsWith('/')) return path;
  if (path.endsWith('.html')) {
    return path.slice(0, path.lastIndexOf('/') + 1);
  }
  const ultimaBarra = path.lastIndexOf('/');
  if (ultimaBarra > 0) return `${path.slice(0, ultimaBarra + 1)}`;
  return '/';
}

/**
 * @returns {boolean}
 */
function esEntornoLocal() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Usar API Node solo en local o si se definió API_BASE_URL explícitamente.
 * @returns {boolean}
 */
function debeUsarApi() {
  return Boolean(API_BASE) || esEntornoLocal();
}

/**
 * Normaliza ID igual que el servidor.
 * @param {string} id
 * @returns {string}
 */
function normalizarId(id) {
  return String(id)
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]/g, '');
}

/**
 * Muestra un valor o guión si está vacío.
 * @param {string|number|null|undefined} valor
 * @returns {string}
 */
function mostrarValor(valor) {
  if (valor === null || valor === undefined) return VACIO;
  const texto = String(valor).trim();
  return texto === '' ? VACIO : texto;
}

function estaVacio(valor) {
  return mostrarValor(valor) === VACIO;
}

function parseNumero(valor) {
  if (estaVacio(valor)) return null;
  const limpio = String(valor).trim().replace(/[$,\s]/g, '');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

function formatNotaDecimal(valor) {
  if (estaVacio(valor)) return VACIO;
  const n = parseNumero(valor);
  if (n === null) return mostrarValor(valor);
  return n.toFixed(1);
}

function formatMoneda(valor) {
  if (estaVacio(valor)) return VACIO;
  const n = parseNumero(valor);
  if (n === null) return mostrarValor(valor);
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function limpiarResultados() {
  elementos.alertaError.classList.add('d-none');
  elementos.alertaError.textContent = '';
  elementos.noEncontrado.classList.add('d-none');
  elementos.tarjeta.classList.add('d-none');
  actualizarBotonBuscarOtro();
}

function actualizarBotonBuscarOtro() {
  const hayResultado =
    !elementos.tarjeta.classList.contains('d-none') ||
    !elementos.noEncontrado.classList.contains('d-none') ||
    !elementos.alertaError.classList.contains('d-none');
  elementos.btnBuscarOtro.classList.toggle('d-none', !hayResultado);
}

function reiniciarBusqueda() {
  elementos.inputId.value = '';
  elementos.inputId.classList.remove('is-invalid');
  limpiarResultados();
  elementos.inputId.focus();
}

function validarId() {
  const id = elementos.inputId.value.trim();
  if (!id) {
    elementos.inputId.classList.add('is-invalid');
    return null;
  }
  elementos.inputId.classList.remove('is-invalid');
  return id;
}

function setCargando(cargando) {
  elementos.btnBuscar.disabled = cargando;
  elementos.btnBuscar.classList.toggle('loading', cargando);
  elementos.spinner.classList.toggle('d-none', !cargando);
}

function mostrarEstudiante(est) {
  const nombreCompleto = [est.Nombre, est.Apellido]
    .map((v) => (v || '').trim())
    .filter(Boolean)
    .join(' ');

  elementos.titulo.textContent = nombreCompleto || VACIO;
  elementos.valorId.textContent = mostrarValor(est.ID);
  elementos.valorNombre.textContent = mostrarValor(est.Nombre);
  elementos.valorApellido.textContent = mostrarValor(est.Apellido);
  elementos.valorGrupo.textContent = mostrarValor(est.Grupo);
  elementos.valorTurno.textContent = mostrarValor(est.Turno);
  elementos.valorIngles.textContent = formatNotaDecimal(est.Ingles);
  elementos.valorInformatica.textContent = formatNotaDecimal(est.Informatica);
  elementos.valorValores.textContent = formatNotaDecimal(est.Valores);
  elementos.valorAusencias.textContent = mostrarValor(est.Ausencias);
  elementos.valorTardanzas.textContent = mostrarValor(est.Tardanzas);
  elementos.valorCuota.textContent = formatMoneda(est.Cuota);

  elementos.tarjeta.classList.remove('d-none');
}

/**
 * Carga js/estudiantes.json (modo GitHub Pages).
 */
async function cargarIndiceLocal() {
  if (indiceLocal) return indiceLocal;

  const url = `${obtenerRutaBase()}js/estudiantes.json`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(
      'No se encontraron datos en el sitio. En su PC ejecute: npm run build-data y suba js/estudiantes.json a GitHub.'
    );
  }

  indiceLocal = await respuesta.json();
  return indiceLocal;
}

/**
 * Búsqueda vía API Node.
 * @param {string} id
 */
async function buscarPorApi(id) {
  const idEncoded = encodeURIComponent(id);
  const respuesta = await fetch(`${API_BASE}/api/estudiante/${idEncoded}`);

  const tipo = respuesta.headers.get('content-type') || '';
  if (!tipo.includes('application/json')) {
    throw new Error(
      'El servidor no respondió con datos. Si usa GitHub Pages, no hace falta API: suba js/estudiantes.json (npm run build-data).'
    );
  }

  if (!respuesta.ok) {
    throw new Error('No se pudo completar la búsqueda. Intente de nuevo.');
  }

  return respuesta.json();
}

/**
 * Búsqueda en JSON local (GitHub Pages).
 * @param {string} id
 */
async function buscarPorJson(id) {
  const indice = await cargarIndiceLocal();
  const clave = normalizarId(id);
  const estudiante = indice[clave] || null;
  return {
    encontrado: Boolean(estudiante),
    estudiante,
  };
}

/**
 * @param {string} id
 */
async function buscarEstudiante(id) {
  limpiarResultados();
  setCargando(true);

  try {
    const datos = debeUsarApi()
      ? await buscarPorApi(id)
      : await buscarPorJson(id);

    if (!datos.encontrado || !datos.estudiante) {
      elementos.noEncontrado.classList.remove('d-none');
      return;
    }

    mostrarEstudiante(datos.estudiante);
  } catch (err) {
    elementos.alertaError.textContent =
      err.message || 'Error de conexión con el servidor.';
    elementos.alertaError.classList.remove('d-none');
  } finally {
    setCargando(false);
    actualizarBotonBuscarOtro();
  }
}

elementos.form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const id = validarId();
  if (!id) return;
  buscarEstudiante(id);
});

elementos.inputId.addEventListener('input', () => {
  if (elementos.inputId.value.trim()) {
    elementos.inputId.classList.remove('is-invalid');
  }
});

elementos.btnBuscarOtro.addEventListener('click', reiniciarBusqueda);

// Precargar JSON en GitHub Pages para que la primera búsqueda sea más rápida
if (!debeUsarApi()) {
  cargarIndiceLocal().catch(() => {
    /* El error se mostrará al buscar */
  });
}
