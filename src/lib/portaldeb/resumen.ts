import { portaldeb } from './client';
import type { Especie, Inventario, Vivero } from './schemas';

// El inventario completo pesa ~230 KB. Se condensa aquí para que las islas
// reciban solo lo que muestran. Cuando exista /api/public/arboles/estadisticas
// en PortalDEB, este cálculo pasa al servidor.

export interface ResumenEspecie {
  id: number;
  nombreComun: string;
  nombreCientifico: string | null;
  total: number;
  viveros: number;
}

export interface ResumenVivero {
  id: number;
  nombre: string;
  direccion: string | null;
  coordenadas: [number, number] | null;
  total: number;
  especies: number;
  destacadas: { nombre: string; cantidad: number }[];
}

export interface Resumen {
  generadoEn: string;
  totales: {
    plantas: number;
    especies: number;
    viveros: number;
    viverosConExistencia: number;
  };
  especies: ResumenEspecie[];
  viveros: ResumenVivero[];
}

export function resumir(viveros: Vivero[], especies: Especie[], inventario: Inventario[]): Resumen {
  const especiesPorId = new Map(especies.map((e) => [e.id, e]));
  const porEspecie = new Map<number, { total: number; viveros: Set<number> }>();
  const porVivero = new Map<number, Map<number, number>>();

  for (const { vivero_id, especie_id, cantidad } of inventario) {
    if (cantidad <= 0) continue;

    const e = porEspecie.get(especie_id) ?? { total: 0, viveros: new Set<number>() };
    e.total += cantidad;
    e.viveros.add(vivero_id);
    porEspecie.set(especie_id, e);

    const v = porVivero.get(vivero_id) ?? new Map<number, number>();
    v.set(especie_id, (v.get(especie_id) ?? 0) + cantidad);
    porVivero.set(vivero_id, v);
  }

  const resumenEspecies: ResumenEspecie[] = especies
    .map((e) => ({
      id: e.id,
      nombreComun: e.nombre_comun,
      nombreCientifico: e.nombre_cientifico,
      total: porEspecie.get(e.id)?.total ?? 0,
      viveros: porEspecie.get(e.id)?.viveros.size ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  const resumenViveros: ResumenVivero[] = viveros
    .map((v) => {
      const stock = [...(porVivero.get(v.id) ?? new Map<number, number>())];
      return {
        id: v.id,
        nombre: v.nombre,
        direccion: v.direccion,
        coordenadas: v.ubicacion?.coordinates ?? null,
        total: stock.reduce((s, [, c]) => s + c, 0),
        especies: stock.length,
        destacadas: stock
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, cantidad]) => ({
            nombre: especiesPorId.get(id)?.nombre_comun ?? `Especie ${id}`,
            cantidad,
          })),
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    generadoEn: new Date().toISOString(),
    totales: {
      plantas: resumenEspecies.reduce((s, e) => s + e.total, 0),
      especies: resumenEspecies.filter((e) => e.total > 0).length,
      viveros: viveros.length,
      viverosConExistencia: resumenViveros.filter((v) => v.total > 0).length,
    },
    especies: resumenEspecies,
    viveros: resumenViveros,
  };
}

export async function cargarResumen(): Promise<Resumen> {
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
