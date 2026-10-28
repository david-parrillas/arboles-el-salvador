import { portaldeb, PortalDebError } from './client';
import type { Especie, Inventario, Vivero } from './schemas';

// Fuente principal: GET /api/public/arboles/resumen, que ya viene resumido y sin
// cantidades. Mientras ese endpoint no esté desplegado (404), se arma el mismo
// resumen con las 3 rutas anteriores; resumir() usa el inventario solo para saber
// QUÉ especies hay en cada vivero y las cantidades no salen de esa función.
// TODO: quitar el respaldo cuando el endpoint esté en producción.

export interface ResumenEspecie {
  id: number;
  nombreComun: string;
  nombreCientifico: string | null;
  /** En cuántos viveros está disponible (0 = sin existencias por ahora). */
  viveros: number;
}

export interface ResumenVivero {
  id: number;
  nombre: string;
  direccion: string | null;
  coordenadas: [number, number] | null;
  /** Nombres comunes de las especies disponibles, en orden alfabético. */
  especies: string[];
}

export interface Resumen {
  generadoEn: string;
  totales: {
    especies: number;
    viveros: number;
  };
  especies: ResumenEspecie[];
  viveros: ResumenVivero[];
}

const alfabetico = new Intl.Collator('es', { sensitivity: 'base' }).compare;

export function resumir(viveros: Vivero[], especies: Especie[], inventario: Inventario[]): Resumen {
  const especiesPorId = new Map(especies.map((e) => [e.id, e]));
  const viverosPorEspecie = new Map<number, Set<number>>();
  const especiesPorVivero = new Map<number, Set<number>>();

  for (const { vivero_id, especie_id, cantidad } of inventario) {
    if (cantidad <= 0) continue;
    viverosPorEspecie.set(especie_id, (viverosPorEspecie.get(especie_id) ?? new Set()).add(vivero_id));
    especiesPorVivero.set(vivero_id, (especiesPorVivero.get(vivero_id) ?? new Set()).add(especie_id));
  }

  const resumenEspecies: ResumenEspecie[] = especies
    .map((e) => ({
      id: e.id,
      nombreComun: e.nombre_comun,
      nombreCientifico: e.nombre_cientifico,
      viveros: viverosPorEspecie.get(e.id)?.size ?? 0,
    }))
    .sort((a, b) => alfabetico(a.nombreComun, b.nombreComun));

  const resumenViveros: ResumenVivero[] = viveros
    .map((v) => ({
      id: v.id,
      nombre: v.nombre,
      direccion: v.direccion,
      coordenadas: v.ubicacion?.coordinates ?? null,
      especies: [...(especiesPorVivero.get(v.id) ?? [])]
        .map((id) => especiesPorId.get(id)?.nombre_comun.split(',')[0].trim())
        .filter((n): n is string => Boolean(n))
        .sort(alfabetico),
    }))
    .sort((a, b) => alfabetico(a.nombre, b.nombre));

  return {
    generadoEn: new Date().toISOString(),
    totales: {
      especies: resumenEspecies.filter((e) => e.viveros > 0).length,
      viveros: resumenViveros.filter((v) => v.especies.length > 0).length,
    },
    especies: resumenEspecies,
    viveros: resumenViveros,
  };
}

export async function cargarResumen(): Promise<Resumen> {
  try {
    return await portaldeb.resumen();
  } catch (error) {
    if (!(error instanceof PortalDebError && error.status === 404)) throw error;
  }
  const [viveros, especies, inventario] = await Promise.all([
    portaldeb.viveros(),
    portaldeb.especiesDisponibles(),
    portaldeb.inventario(),
  ]);
  return resumir(viveros, especies, inventario);
}

/** Para el build: si el Portal no responde, la página se genera igual sin datos. */
export async function cargarResumenSeguro(): Promise<Resumen | null> {
  try {
    return await cargarResumen();
  } catch (error) {
    console.warn('[portaldeb] No se pudo cargar el resumen en el build:', error);
    return null;
  }
}
