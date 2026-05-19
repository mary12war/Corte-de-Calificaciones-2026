# Consulta de Estudiantes (Excel → Web)

Aplicación web para **buscar y visualizar** datos de estudiantes cargados desde un archivo Excel (`.xlsx`). El backend lee el archivo al arrancar, mantiene los datos **en memoria** y expone una API REST. El frontend permite consultar por cédula/ID.

## ¿Por qué Node.js + Express?

- **Despliegue rápido**: un solo proceso sirve API y archivos estáticos.
- **Excel en Node**: la librería [`xlsx`](https://www.npmjs.com/package/xlsx) lee `.xlsx` sin dependencias de Office.
- **Hosting sencillo**: compatible con Render, Railway, VPS, etc.

> **Alternativa (opcional):** Flask + pandas en Python también lee Excel con pocas líneas (`pd.read_excel`), útil si ya tiene un ecosistema Python. Para este proyecto se eligió Node por simplicidad de un único `package.json` y cliente estático sin build.

## Estructura del repositorio

```
consulta-estudiantes/
├── README.md
├── .gitignore
├── package.json
├── server/
│   ├── index.js           # Servidor Express
│   ├── excelLoader.js     # Lectura y normalización del Excel
│   └── routes/
│       └── estudiante.js  # GET /api/estudiante/:id, POST /api/upload
├── client/
│   ├── index.html
│   ├── css/styles.css
│   └── js/main.js
├── data/
│   └── CORTEPRIMERSEMESTRE2026.xlsx   # No se sirve públicamente
└── scripts/
    ├── start.sh           # Arranque en desarrollo
    ├── build.sh           # Verificación pre-despliegue
    └── generate-sample-xlsx.js
```

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- npm 9+

## Instalación y arranque

```bash
# 1. Clonar o entrar al proyecto
cd consulta-estudiantes

# 2. Instalar dependencias
npm install

# 3. Generar Excel de ejemplo (si no existe)
npm run generate-sample

# 4. Iniciar servidor
npm start
```

Abra el navegador en: **http://localhost:3000**

### Desarrollo con recarga automática

```bash
npm run dev
```

### Script de arranque (Linux / macOS / Git Bash)

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

## Cómo probar

Use estos IDs del archivo de ejemplo (también funcionan **sin guiones** o con espacios; el servidor normaliza):

| ID en Excel        | Nombre   |
|--------------------|----------|
| `001-1234567-1`    | Ana Gómez |
| `001-2345678-2`    | Luis Pérez |
| `0013456789`       | María Rodríguez |
| `402-9876543-1`    | Carlos Martínez |
| `001-5556667-7`    | Diego Hernández |

En la web, escriba la cédula y pulse **Buscar**. Si no existe, verá *Estudiante no encontrado*.

### API manual

```bash
curl http://localhost:3000/api/estudiante/001-1234567-1
```

Respuesta exitosa:

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

### Subir nuevo Excel (opcional)

```bash
curl -X POST -F "archivo=@data/mi_lista.xlsx" http://localhost:3000/api/estudiante/upload
```

Límite: **5 MB**. Solo extensión `.xlsx`.

## Formato del Excel

La primera hoja debe tener **exactamente** estas columnas:

`ID`, `Nombre`, `Apellido`, `Turno`, `Grupo`, `Ingles`, `Informatica`, `Valores`, `Ausencias`, `Tardanzas`, `Cuota`

## Reemplazar el archivo en `/data`

1. Prepare su `.xlsx` con las columnas indicadas.
2. Sustituya `data/CORTEPRIMERSEMESTRE2026.xlsx` (o renombre el suyo a ese nombre).
3. Reinicie el servidor: `npm start`.

La ruta del archivo **no** se expone en las respuestas de la API.

## Seguridad y datos en GitHub

- La carpeta `/data` **no** se sirve como archivos estáticos.
- Si sus datos son reales, **no** los suba a GitHub. En `.gitignore` puede descomentar:

  ```
  # /data/CORTEPRIMERSEMESTRE2026.xlsx
  # /data/*.xlsx
  ```

  Luego cada entorno genera o copia su propio Excel localmente (`npm run generate-sample`).

## Subir el repositorio a GitHub

```bash
git init
git add .
git commit -m "Aplicación consulta estudiantes desde Excel"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/consulta-estudiantes.git
git push -u origin main
```

Cree antes el repositorio vacío en GitHub (sin README si ya incluye uno local).

## Variables de entorno

| Variable | Descripción        | Por defecto |
|----------|--------------------|-------------|
| `PORT`   | Puerto del servidor | `3000`      |

## Licencia

MIT
