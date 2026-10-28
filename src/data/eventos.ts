// DATOS DE EJEMPLO. PortalDEB todavía no tiene el módulo de jornadas; cuando exista,
// esto se reemplaza por GET /api/public/arboles/eventos (en el build y en una isla).

export interface Evento {
  id: number;
  titulo: string;
  fecha: string; // ISO
  lugar: string;
  departamento: string;
  tipo: 'Jornada' | 'Taller' | 'Entrega';
  cupos: number;
  inscritos: number;
}

export const eventosEjemplo: Evento[] = [
  {
    id: 1,
    titulo: 'Reforestación de la cuenca del río Sucio',
    fecha: '2026-11-08T07:30:00-06:00',
    lugar: 'ANP Santa Rita',
    departamento: 'Ahuachapán',
    tipo: 'Jornada',
    cupos: 120,
    inscritos: 87,
  },
  {
    id: 2,
    titulo: 'Taller: cómo sembrar y cuidar tu árbol',
    fecha: '2026-11-14T09:00:00-06:00',
    lugar: 'Vivero ANP La Magdalena',
    departamento: 'Santa Ana',
    tipo: 'Taller',
    cupos: 40,
    inscritos: 12,
  },
  {
    id: 3,
    titulo: 'Corredor verde escolar',
    fecha: '2026-11-21T08:00:00-06:00',
    lugar: 'Complejo San Marcelino',
    departamento: 'Sonsonate',
    tipo: 'Jornada',
    cupos: 200,
    inscritos: 196,
  },
  {
    id: 4,
    titulo: 'Entrega comunitaria de frutales',
    fecha: '2026-12-05T08:00:00-06:00',
    lugar: 'PN Montecristo',
    departamento: 'Santa Ana',
    tipo: 'Entrega',
    cupos: 80,
    inscritos: 31,
  },
];
