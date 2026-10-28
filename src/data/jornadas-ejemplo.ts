import type { Jornada } from '../lib/portaldeb/schemas';

// DATOS DE EJEMPLO: solo se muestran mientras /api/public/arboles/jornadas responde 404.

const descripcion = [
  '🌳Esta actividad permitirá incrementar la cobertura vegetal del área, promoviendo entornos más saludables y contribuyendo a la conservación del patrimonio natural.',
  '🦋Los árboles sembrados favorecerán las condiciones necesarias para que las diversas especies de fauna encuentren refugio, alimento y espacios adecuados para su desarrollo.',
  '🌎La participación en estas acciones demuestra el compromiso con la sostenibilidad y el cuidado de los recursos naturales, generando beneficios que perduran en el tiempo.',
].join('\n\n');

export const jornadasEjemplo: Jornada[] = [
  {
    id: 1,
    titulo: 'Reforestación de la cuenca del río Sucio',
    inicio: '2026-11-08T07:30:00-06:00',
    fin: '2026-11-08T12:00:00-06:00',
    lugares: [{ id: 1, nombre: 'ANP Santa Rita', departamento: 'Ahuachapán', coordenadas: null }],
    descripcion,
  },
  {
    id: 2,
    titulo: 'Corredor verde del occidente',
    inicio: '2026-11-21T08:00:00-06:00',
    fin: '2026-11-22T13:00:00-06:00',
    lugares: [
      { id: 2, nombre: 'Complejo San Marcelino', departamento: 'Sonsonate', coordenadas: null },
      { id: 3, nombre: 'ANP Los Cóbanos', departamento: 'Sonsonate', coordenadas: null },
    ],
    descripcion,
  },
  {
    id: 3,
    titulo: 'Jornada en el bosque nebuloso',
    inicio: '2026-12-05T08:00:00-06:00',
    fin: '2026-12-05T11:30:00-06:00',
    lugares: [{ id: 4, nombre: 'PN Montecristo', departamento: 'Santa Ana', coordenadas: null }],
    descripcion,
  },
];
