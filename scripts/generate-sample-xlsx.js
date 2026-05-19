/**
 * Genera data/CORTEPRIMERSEMESTRE2026.xlsx con datos de prueba (8 estudiantes).
 * Ejecutar: npm run generate-sample
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const OUT = path.join(__dirname, '..', 'data', 'CORTEPRIMERSEMESTRE2026.xlsx');

const filas = [
  {
    ID: '001-1234567-1',
    Nombre: 'Ana',
    Apellido: 'Gómez',
    Turno: 'Mañana',
    Grupo: '3A',
    'Ingles': '92',
    'Informatica': '88',
    Valores: '95',
    Ausencias: '2',
    Tardanzas: '1',
    Cuota: '1500',
  },
  {
    ID: '001-2345678-2',
    Nombre: 'Luis',
    Apellido: 'Pérez',
    Turno: 'Tarde',
    Grupo: '3B',
    'Ingles': '78',
    'Informatica': '85',
    Valores: '90',
    Ausencias: '0',
    Tardanzas: '3',
    Cuota: '1500',
  },
  {
    ID: '0013456789',
    Nombre: 'María',
    Apellido: 'Rodríguez',
    Turno: 'Mañana',
    Grupo: '4A',
    'Ingles': '95',
    'Informatica': '91',
    Valores: '93',
    Ausencias: '1',
    Tardanzas: '0',
    Cuota: '1750',
  },
  {
    ID: '402-9876543-1',
    Nombre: 'Carlos',
    Apellido: 'Martínez',
    Turno: 'Mañana',
    Grupo: '5B',
    'Ingles': '82',
    'Informatica': '79',
    Valores: '88',
    Ausencias: '4',
    Tardanzas: '2',
    Cuota: '2000',
  },
  {
    ID: '402-1112233-4',
    Nombre: 'Sofía',
    Apellido: 'López',
    Turno: 'Tarde',
    Grupo: '2A',
    'Ingles': '90',
    'Informatica': '94',
    Valores: '96',
    Ausencias: '',
    Tardanzas: '',
    Cuota: '1200',
  },
  {
    ID: '001-5556667-7',
    Nombre: 'Diego',
    Apellido: 'Hernández',
    Turno: 'Mañana',
    Grupo: '6A',
    'Ingles': '70',
    'Informatica': '72',
    Valores: '75',
    Ausencias: '6',
    Tardanzas: '5',
    Cuota: '2200',
  },
  {
    ID: '001-8889990-0',
    Nombre: 'Valentina',
    Apellido: 'Díaz',
    Turno: 'Tarde',
    Grupo: '1B',
    'Ingles': '88',
    'Informatica': '86',
    Valores: '91',
    Ausencias: '1',
    Tardanzas: '1',
    Cuota: '1100',
  },
  {
    ID: '001-0001112-3',
    Nombre: 'Jorge',
    Apellido: 'Ramírez',
    Turno: 'Mañana',
    Grupo: '4B',
    'Ingles': '65',
    'Informatica': '68',
    Valores: '70',
    Ausencias: '8',
    Tardanzas: '4',
    Cuota: '1800',
  },
];

const dir = path.dirname(OUT);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const hoja = XLSX.utils.json_to_sheet(filas);
const libro = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(libro, hoja, 'Estudiantes');
XLSX.writeFile(libro, OUT);

console.log(`Archivo generado: ${OUT}`);
console.log(`${filas.length} filas de ejemplo.`);
console.log('IDs de prueba: 001-1234567-1, 0013456789, 402-9876543-1');
