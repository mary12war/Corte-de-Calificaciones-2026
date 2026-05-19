# Corte de Calificaciones 2026

Consulta web de estudiantes a partir de un archivo Excel (`.xlsx`). El servidor carga los datos al iniciar, los mantiene en memoria y expone una API REST. El frontend permite buscar por cédula o ID.

## Características

- Búsqueda por ID con normalización (sin guiones, espacios, etc.)
- Calificaciones formateadas (notas con un decimal, cuota en moneda)
- El archivo Excel en `/data` **no** se publica como archivo estático
- Carga opcional de un nuevo `.xlsx` vía API (`POST /api/estudiante/upload`)

## Stack: Node.js + Express

- Un solo proceso sirve la API y el cliente estático
- Lectura de Excel con la librería [`xlsx`](https://www.npmjs.com/package/xlsx), sin Microsoft Office
- Fácil de desplegar en Render, Railway, VPS, etc.

> **Alternativa:** Flask + `pandas` (`pd.read_excel`) si prefiere Python. Este proyecto usa Node por un único `package.json` y frontend sin paso de compilación.

## Estructura

```text
Corte-de-Calificaciones-2026/
├── index.html          # Raíz: GitHub Pages sirve esta página
├── css/styles.css
├── js/main.js
├── README.md
├── package.json
├── server/
│   ├── index.js
│   ├── excelLoader.js
│   └── routes/estudiante.js
├── data/
│   └── CORTEPRIMERSEMESTRE2026.xlsx
└── scripts/
    ├── start.sh
    ├── build.sh
    └── generate-sample-xlsx.js
```

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
git clone https://github.com/TU_USUARIO/Corte-de-Calificaciones-2026.git
cd Corte-de-Calificaciones-2026
npm install
npm start
```

Abrir en el navegador: **http://localhost:3000**

### Desarrollo (recarga automática)

```bash
npm run dev
```

### Windows (PowerShell)

```powershell
npm install
npm start
```

Si el puerto 3000 está ocupado:

```powershell
$env:PORT=3001; npm start
```

## Archivo de datos

Por defecto el servidor lee:

`data/CORTEPRIMERSEMESTRE2026.xlsx`

Configurado en `server/index.js`. Para usar otro archivo, cambie la constante `DATA_FILE` o reemplace ese `.xlsx` y reinicie con `npm start`.

### Columnas obligatorias en el Excel

| Columna | Descripción |
|---------|-------------|
| ID | Cédula o identificador |
| Nombre | Nombre del estudiante |
| Apellido | Apellido |
| Turno | Mañana / Tarde, etc. |
| Grupo | Grupo o sección |
| Ingles | Nota de inglés |
| Informatica | Nota de informática |
| Valores | Nota de valores |
| Ausencias | Cantidad de ausencias |
| Tardanzas | Cantidad de tardanzas |
| Cuota | Monto de cuota |

## Cómo probar

1. Inicie el servidor (`npm start`).
2. En la web, ingrese un **ID** que exista en su Excel.
3. Pulse **Buscar**.

Los IDs pueden escribirse con o sin guiones; el servidor los normaliza.

Ejemplo de API:

```bash
curl http://localhost:3000/api/estudiante/001-1234567-1
```

Respuesta cuando existe:

```json
{
  "encontrado": true,
  "estudiante": {
    "ID": "001-1234567-1",
    "Nombre": "Ana",
    "Apellido": "Gómez",
    "Turno": "Mañana",
    "Grupo": "3A",
    "Ingles": "92",
    "Informatica": "88",
    "Valores": "95",
    "Ausencias": "2",
    "Tardanzas": "1",
    "Cuota": "1500"
  }
}
```

### Subir otro Excel (opcional)

```bash
curl -X POST -F "archivo=@data/mi_lista.xlsx" http://localhost:3000/api/estudiante/upload
```

Máximo **5 MB**. Solo `.xlsx`.

## GitHub Pages

GitHub Pages **no ejecuta Node.js**, por eso la búsqueda usa `js/estudiantes.json` generado desde su Excel.

1. Actualice el Excel en `data/CORTEPRIMERSEMESTRE2026.xlsx`.
2. Genere el JSON y súbalo a GitHub:

```bash
npm run build-data
git add js/estudiantes.json
git commit -m "Actualizar datos para GitHub Pages"
git push
```

3. En el repositorio: **Settings → Pages → Source**: rama `main`, carpeta **`/ (root)`**.

La URL será: `https://TU_USUARIO.github.io/Corte-de-Calificaciones-2026/`

> **Nota:** `js/estudiantes.json` es público en el sitio (como cualquier archivo estático). No suba datos sensibles si el repositorio es público.

En **local** (`npm start`) se usa la API con el Excel en memoria; no hace falta regenerar el JSON salvo para publicar en Pages.

## Seguridad y GitHub

- No se expone la ruta del archivo Excel en las respuestas de la API.
- Si el Excel contiene **datos reales de estudiantes**, no lo suba al repositorio. En `.gitignore` descomente:

```gitignore
/data/CORTEPRIMERSEMESTRE2026.xlsx
/data/*.xlsx
```

Cada entorno copia su propio archivo en `/data` de forma local.

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto HTTP del servidor | `3000` |

## Licencia

MIT
