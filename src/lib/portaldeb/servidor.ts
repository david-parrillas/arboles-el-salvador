import { PORTALDEB_TOKEN, PORTALDEB_URL } from 'astro:env/server';
import { jornadasEjemplo } from '../../data/jornadas-ejemplo';
import { resumenEjemplo } from '../../data/resumen-ejemplo';

// Solo servidor (build y proxy de src/pages/api/): lleva el token del Portal.
// Ninguna isla ni módulo que importe una isla puede importar este archivo.

export type RutaPortal = '/arboles/resumen' | '/arboles/jornadas';

const TIMEOUT_MS = 10_000;

const datosDeEjemplo: Record<RutaPortal, unknown> = {
  '/arboles/resumen': resumenEjemplo,
  '/arboles/jornadas': jornadasEjemplo,
};

export class PortalDebError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'PortalDebError';
  }
}

/** 401/403: el token falta, es inválido, fue revocado, venció o no tiene arboles:read. */
export function esErrorDeToken(error: unknown): error is PortalDebError {
  return error instanceof PortalDebError && (error.status === 401 || error.status === 403);
}

/** Errores pasajeros: red o timeout (sin status) o 5xx. */
export function esErrorTransitorio(error: unknown): boolean {
  return error instanceof PortalDebError && (error.status === undefined || error.status >= 500);
}

function isTimeout(error: unknown) {
  return error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError');
}

/** GET al Portal con el token; devuelve el JSON sin tocar. */
export async function pedirAlPortal(ruta: RutaPortal): Promise<unknown> {
  if (!PORTALDEB_TOKEN) {
    // En dev se sirven datos de ejemplo para poder trabajar sin token.
    if (import.meta.env.DEV) return datosDeEjemplo[ruta];
    throw new Error('[portaldeb] Falta PORTALDEB_TOKEN. Defínelo en .env o en las variables del entorno.');
  }
  let res: Response;
  try {
    res = await fetch(`${PORTALDEB_URL.replace(/\/$/, '')}/api${ruta}`, {
      headers: { Authorization: `Bearer ${PORTALDEB_TOKEN}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const motivo = isTimeout(error) ? `no respondió en ${TIMEOUT_MS / 1000} s` : 'no es accesible';
    throw new PortalDebError(`PortalDEB ${motivo} (${ruta})`, undefined, { cause: error });
  }
  if (!res.ok) {
    throw new PortalDebError(`PortalDEB respondió ${res.status} en ${ruta}`, res.status);
  }
  return res.json();
}
