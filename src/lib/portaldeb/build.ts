import { z } from 'zod';
import { jornadasEjemplo } from '../../data/jornadas-ejemplo';
import type { Jornadas } from './jornadas';
import type { Resumen } from './resumen';
import { jornadaSchema, resumenSchema } from './schemas';
import { esErrorDeToken, esErrorTransitorio, PortalDebError, pedirAlPortal, type RutaPortal } from './servidor';

// Datos que se escriben en el HTML al compilar (SEO y respaldo de las islas).
// - Red, timeout o 5xx: la página se genera sin esos datos (null) y la isla reintenta.
// - 401/403: el build falla, para no publicar el sitio vacío con un token vencido.
// - Cualquier otro error (404, 429, JSON inválido) también hace fallar el build.

async function cargarEnBuild<S extends z.ZodType>(ruta: RutaPortal, schema: S): Promise<z.infer<S> | null> {
  try {
    return schema.parse(await pedirAlPortal(ruta));
  } catch (error) {
    if (esErrorDeToken(error)) {
      throw new Error(
        `[portaldeb] PortalDEB rechazó el token (${error.status}) en ${ruta}: PORTALDEB_TOKEN es inválido, ` +
          'fue revocado, venció o no tiene la ability arboles:read. Emite uno nuevo en Admin > Clientes API.',
        { cause: error },
      );
    }
    if (!esErrorTransitorio(error)) throw error;
    console.warn(`[portaldeb] No se pudo cargar ${ruta} en el build; se genera sin datos:`, error);
    return null;
  }
}

export function cargarResumenSeguro(): Promise<Resumen | null> {
  return cargarEnBuild('/arboles/resumen', resumenSchema);
}

// TODO: quitar el respaldo de ejemplo cuando /api/arboles/jornadas esté en producción.
export async function cargarJornadasSeguro(): Promise<Jornadas | null> {
  try {
    const lista = await cargarEnBuild('/arboles/jornadas', z.array(jornadaSchema));
    return lista && { lista, ejemplo: false };
  } catch (error) {
    if (error instanceof PortalDebError && error.status === 404) return { lista: jornadasEjemplo, ejemplo: true };
    throw error;
  }
}
