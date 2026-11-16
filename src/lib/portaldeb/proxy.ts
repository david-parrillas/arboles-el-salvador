import type { APIRoute } from 'astro';
import { esErrorDeToken, pedirAlPortal, type RutaPortal } from './servidor';

// Proxy de mismo origen para las islas: el token se queda en el servidor.
// Cada instancia de Cloud Run guarda su copia 5 min, así las visitas no llegan
// al Portal (límite de 60 peticiones/min por token). Si el Portal falla, se sirve
// la copia vieja; si no hay ninguna, 502.

const TTL_MS = 5 * 60_000;
// Tras un fallo no se vuelve a llamar al Portal en este lapso (evita alargar un 429).
const ESPERA_TRAS_FALLO_MS = 30_000;

export function crearProxy(ruta: RutaPortal): APIRoute {
  let copia: { cuerpo: string; guardadaEn: number } | null = null;
  let reintentarDesde = 0;
  // Peticiones simultáneas con la caché vencida comparten una sola llamada al Portal.
  let enCurso: Promise<string> | null = null;

  function refrescar() {
    enCurso ??= pedirAlPortal(ruta)
      .then((json) => {
        const cuerpo = JSON.stringify(json);
        copia = { cuerpo, guardadaEn: Date.now() };
        return cuerpo;
      })
      .finally(() => {
        enCurso = null;
      });
    return enCurso;
  }

  // Sin parámetros: no se reenvía al Portal nada de la petición del visitante.
  return async () => {
    if (copia && Date.now() - copia.guardadaEn < TTL_MS) return responder(copia.cuerpo);
    if (Date.now() < reintentarDesde) return copiaOFallo();
    try {
      return responder(await refrescar());
    } catch (error) {
      reintentarDesde = Date.now() + ESPERA_TRAS_FALLO_MS;
      const log = esErrorDeToken(error) ? console.error : console.warn;
      log(`[portaldeb] Proxy ${ruta}: ${copia ? 'se sirve la copia vieja' : 'sin copia, 502'}.`, error);
      return copiaOFallo();
    }
  };

  function copiaOFallo() {
    if (copia) return responder(copia.cuerpo);
    return Response.json(
      { message: 'Los datos no están disponibles en este momento.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

function responder(cuerpo: string) {
  return new Response(cuerpo, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  });
}

/** Cualquier método que no sea GET. */
export const soloGet: APIRoute = () => new Response(null, { status: 405, headers: { Allow: 'GET' } });
