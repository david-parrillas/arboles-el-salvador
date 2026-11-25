import type { Resumen, ResumenEspecie, ResumenVivero } from '../lib/portaldeb/resumen';

// DATOS DE EJEMPLO: solo se usan en desarrollo cuando no hay PORTALDEB_TOKEN.
// Coordenadas en [lng, lat], como en el contrato del Portal.
// Los conteos de viveros por especie se calculan a partir de la lista de viveros.

const catalogo: Omit<ResumenEspecie, 'viveros'>[] = [
  { id: 1, nombreComun: 'Maquilishuat', nombreCientifico: 'Tabebuia rosea' },
  { id: 2, nombreComun: 'Cedro', nombreCientifico: 'Cedrela odorata' },
  { id: 3, nombreComun: 'Caoba', nombreCientifico: 'Swietenia humilis' },
  { id: 4, nombreComun: 'Conacaste', nombreCientifico: 'Enterolobium cyclocarpum' },
  { id: 5, nombreComun: 'Ceiba', nombreCientifico: 'Ceiba pentandra' },
  { id: 6, nombreComun: 'Madrecacao', nombreCientifico: 'Gliricidia sepium' },
  { id: 7, nombreComun: 'Guachipilín', nombreCientifico: 'Diphysa americana' },
  { id: 8, nombreComun: 'Bálsamo', nombreCientifico: 'Myroxylon balsamum' },
  { id: 9, nombreComun: 'Laurel', nombreCientifico: 'Cordia alliodora' },
  { id: 10, nombreComun: 'Morro', nombreCientifico: 'Crescentia alata' },
  { id: 11, nombreComun: 'Pino ocote', nombreCientifico: 'Pinus oocarpa' },
  { id: 12, nombreComun: 'Mangle rojo', nombreCientifico: 'Rhizophora mangle' },
  { id: 13, nombreComun: 'Copinol', nombreCientifico: 'Hymenaea courbaril' },
  { id: 14, nombreComun: 'Izote', nombreCientifico: null },
];

const viveros: ResumenVivero[] = [
  {
    id: 1,
    nombre: 'Vivero Santa Tecla',
    direccion: 'Km 12 carretera al Puerto de La Libertad, Santa Tecla, La Libertad',
    coordenadas: [-89.2797, 13.6769],
    ubicacion: {
      departamento: { id: 5, nombre: 'La Libertad' },
      municipio: { id: 17, nombre: 'La Libertad Sur' },
      distrito: { id: 101, nombre: 'Santa Tecla' },
    },
    especies: ['Bálsamo', 'Caoba', 'Cedro', 'Guachipilín', 'Laurel', 'Madrecacao', 'Maquilishuat'],
  },
  {
    id: 2,
    nombre: 'Vivero San Andrés',
    direccion: 'Valle de San Andrés, Ciudad Arce, La Libertad',
    coordenadas: [-89.4072, 13.8086],
    ubicacion: {
      departamento: { id: 5, nombre: 'La Libertad' },
      municipio: { id: 16, nombre: 'La Libertad Oeste' },
      distrito: { id: 102, nombre: 'Ciudad Arce' },
    },
    especies: ['Ceiba', 'Conacaste', 'Copinol', 'Madrecacao', 'Maquilishuat', 'Morro'],
  },
  {
    id: 3,
    nombre: 'Vivero Montecristo',
    direccion: 'Metapán, Santa Ana',
    coordenadas: [-89.4333, 14.3167],
    ubicacion: {
      departamento: { id: 2, nombre: 'Santa Ana' },
      municipio: { id: 4, nombre: 'Santa Ana Norte' },
      distrito: { id: 103, nombre: 'Metapán' },
    },
    especies: ['Cedro', 'Guachipilín', 'Pino ocote'],
  },
  {
    id: 4,
    nombre: 'Vivero Bahía de Jiquilisco',
    direccion: 'Puerto El Triunfo, Usulután',
    coordenadas: [-88.55, 13.2833],
    ubicacion: {
      departamento: { id: 11, nombre: 'Usulután' },
      municipio: { id: 36, nombre: 'Usulután Oeste' },
      distrito: { id: 104, nombre: 'Puerto El Triunfo' },
    },
    especies: ['Mangle rojo', 'Morro'],
  },
  {
    id: 5,
    nombre: 'Vivero San Miguel',
    direccion: null,
    coordenadas: [-88.1833, 13.4833],
    ubicacion: {
      departamento: { id: 12, nombre: 'San Miguel' },
      municipio: { id: 39, nombre: 'San Miguel Centro' },
      distrito: { id: 105, nombre: 'San Miguel' },
    },
    especies: ['Caoba', 'Conacaste', 'Laurel', 'Maquilishuat'],
  },
];

const especies: ResumenEspecie[] = catalogo.map((e) => ({
  ...e,
  viveros: viveros.filter((v) => v.especies.includes(e.nombreComun)).length,
}));

export const resumenEjemplo: Resumen = {
  generadoEn: new Date().toISOString(),
  totales: {
    especies: especies.filter((e) => e.viveros > 0).length,
    viveros: viveros.length,
  },
  especies,
  viveros,
};
