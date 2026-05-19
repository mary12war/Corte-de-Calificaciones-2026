/**
 * Cliente: búsqueda de estudiantes por ID vía API REST.
 */

/** Vacío = mismo origen (npm start). En GitHub Pages definir window.API_BASE_URL en index.html */
const API_BASE = (window.API_BASE_URL || '').replace(/\/$/, '');

const VACIO = '—';

const elementos = {
  form: document.getElementById('form-busqueda'),
  inputId: document.getElementById('input-id'),
  feedbackId: document.getElementById('feedback-id'),
  btnBuscar: document.getElementById('btn-buscar'),
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
 * Muestra un valor o guión si está vacío.
 * @param {string|number|null|undefined} valor
 * @returns {string}
 */
function mostrarValor(valor) {
  if (valor === null || valor === undefined) return VACIO;
  const texto = String(valor).trim();
  return texto === '' ? VACIO : texto;
}

/**
 * @param {string|number|null|undefined} valor
 * @returns {boolean}
 */
function estaVacio(valor) {
  return mostrarValor(valor) === VACIO;
}

/**
 * Convierte texto numérico (admite $, comas) a número o null.
 * @param {string|number|null|undefined} valor
 * @returns {number|null}
 */
function parseNumero(valor) {
  if (estaVacio(valor)) return null;
  const limpio = String(valor).trim().replace(/[$,\s]/g, '');
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/**
 * Calificación con un decimal: 5 → "5.0", 92 → "92.0"
 * @param {string|number|null|undefined} valor
 * @returns {string}
 */
function formatNotaDecimal(valor) {
  if (estaVacio(valor)) return VACIO;
  const n = parseNumero(valor);
  if (n === null) return mostrarValor(valor);
  return n.toFixed(1);
}

/**
 * Monto en formato moneda: 20 → "$20.00"
 * @param {string|number|null|undefined} valor
 * @returns {string}
 */
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

/**
 * Oculta todos los paneles de resultado.
 */
function limpiarResultados() {
  elementos.alertaError.classList.add('d-none');
  elementos.alertaError.textContent = '';
  elementos.noEncontrado.classList.add('d-none');
  elementos.tarjeta.classList.add('d-none');
}

/**
 * Valida el ID ingresado (trim, no vacío).
 * @returns {string|null} ID listo para la URL o null si inválido
 */
function validarId() {
  const id = elementos.inputId.value.trim();
  if (!id) {
    elementos.inputId.classList.add('is-invalid');
    return null;
  }
  elementos.inputId.classList.remove('is-invalid');
  return encodeURIComponent(id);
}

/**
 * Activa o desactiva estado de carga del botón.
 * @param {boolean} cargando
 */
function setCargando(cargando) {
  elementos.btnBuscar.disabled = cargando;
  elementos.btnBuscar.classList.toggle('loading', cargando);
  elementos.spinner.classList.toggle('d-none', !cargando);
}

/**
 * Rellena la tarjeta con los datos del estudiante.
 * @param {Object} est
 */
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
 * Consulta la API por ID.
 * @param {string} idEncoded
 */
async function buscarEstudiante(idEncoded) {
  limpiarResultados();
  setCargando(true);

  try {
    const respuesta = await fetch(`${API_BASE}/api/estudiante/${idEncoded}`);

    if (!respuesta.ok) {
      throw new Error('No se pudo completar la búsqueda. Intente de nuevo.');
    }

    const datos = await respuesta.json();

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
  }
}

elementos.form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const idEncoded = validarId();
  if (!idEncoded) return;
  buscarEstudiante(idEncoded);
});

elementos.inputId.addEventListener('input', () => {
  if (elementos.inputId.value.trim()) {
    elementos.inputId.classList.remove('is-invalid');
  }
});
