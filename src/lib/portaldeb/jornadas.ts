import { jornadasEjemplo } from '../../data/jornadas-ejemplo';
import { portaldeb, PortalDebError } from './client';
import type { Jornada } from './schemas';

export type { Jornada };

export interface Jornadas {
  lista: Jornada[];
  /** true mientras el endpoint no esté desplegado y se muestran datos de ejemplo. */
  ejemplo: boolean;
}

// TODO: quitar el respaldo de ejemplo cuando /api/public/arboles/jornadas esté en producción.
export async function cargarJornadas(): Promise<Jornadas> {
  try {
    return { lista: await portaldeb.jornadas(), ejemplo: false };
  } catch (error) {
    if (error instanceof PortalDebError && error.status === 404) return { lista: jornadasEjemplo, ejemplo: true };
    throw error;
  }
}

/** Para el build: si el Portal no responde, la sección se genera vacía y la isla reintenta. */
export async function cargarJornadasSeguro(): Promise<Jornadas | null> {
  try {
    return await cargarJornadas();
  } catch (error) {
    console.warn('[portaldeb] No se pudieron cargar las jornadas en el build:', error);
    return null;
  }
}
