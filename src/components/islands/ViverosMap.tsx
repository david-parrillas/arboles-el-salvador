import type Graphic from '@arcgis/core/Graphic';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type MapView from '@arcgis/core/views/MapView';
import { useEffect, useRef, useState } from 'react';
import type { ResumenVivero } from '../../lib/portaldeb/resumen';

interface Props {
  viveros: ResumenVivero[];
  seleccionado: number | null;
  onSeleccionar: (id: number) => void;
}

interface Estado {
  view: MapView;
  capa: GraphicsLayer;
  Graphic: typeof Graphic;
}

const CENTRO_SV: [number, number] = [-88.9, 13.72];

// ArcGIS no entiende variables CSS: se leen del tema de Tailwind en tiempo de ejecución.
function colorTema(nombre: string, respaldo: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim() || respaldo;
}

export default function ViverosMap({ viveros, seleccionado, onSeleccionar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const estado = useRef<Estado | null>(null);
  const alSeleccionar = useRef(onSeleccionar);
  alSeleccionar.current = onSeleccionar;
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState(false);

  // ArcGIS (~2 MB) se descarga solo en el navegador y solo cuando la sección es visible.
  useEffect(() => {
    let cancelado = false;
    let view: MapView | undefined;

    (async () => {
      const [{ default: ArcMap }, { default: ArcMapView }, { default: ArcGraphicsLayer }, { default: ArcGraphic }] =
        await Promise.all([
          import('@arcgis/core/Map'),
          import('@arcgis/core/views/MapView'),
          import('@arcgis/core/layers/GraphicsLayer'),
          import('@arcgis/core/Graphic'),
          import('@arcgis/core/assets/esri/themes/light/main.css'),
        ]);
      if (cancelado || !contenedor.current) return;

      const capa = new ArcGraphicsLayer();
      view = new ArcMapView({
        container: contenedor.current,
        map: new ArcMap({ basemap: 'hybrid', layers: [capa] }),
        center: CENTRO_SV,
        zoom: 8,
        constraints: { minZoom: 7, rotationEnabled: false },
        popupEnabled: false,
      });
      view.ui.components = ['zoom'];
      // Sin WebGL2 (equipos antiguos o sin aceleración) la vista no arranca; la lista sigue sirviendo.
      view.when().catch(() => !cancelado && setFallo(true));

      view.on('click', async (evento) => {
        const { results } = await view!.hitTest(evento, { include: capa });
        const hit = results.find((r): r is __esri.GraphicHit => r.type === 'graphic');
        if (hit) alSeleccionar.current(hit.graphic.attributes.id as number);
      });

      estado.current = { view, capa, Graphic: ArcGraphic };
      setListo(true);
    })();

    return () => {
      cancelado = true;
      view?.destroy();
      estado.current = null;
    };
  }, []);

  useEffect(() => {
    const e = estado.current;
    if (!listo || !e) return;

    const verde = colorTema('--color-verde', '#2f8944');
    const rosa = colorTema('--color-rosa-400', '#f0a5c2');
    const marino = colorTema('--color-marino', '#27295c');

    e.capa.removeAll();
    // El seleccionado se dibuja al final para que quede encima de los demás.
    const ordenados = [...viveros].sort((a, b) => Number(a.id === seleccionado) - Number(b.id === seleccionado));
    for (const v of ordenados) {
      if (!v.coordenadas) continue;
      const activo = v.id === seleccionado;
      e.capa.add(
        new e.Graphic({
          geometry: { type: 'point', longitude: v.coordenadas[0], latitude: v.coordenadas[1] },
          attributes: { id: v.id },
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            color: activo ? rosa : v.especies.length > 0 ? verde : '#9ca3af',
            size: activo ? 22 : 14,
            outline: { color: activo ? marino : '#ffffff', width: activo ? 3 : 1.5 },
          },
        }),
      );
    }

    const elegido = viveros.find((v) => v.id === seleccionado);
    if (elegido?.coordenadas) {
      e.view.goTo({ center: elegido.coordenadas, zoom: 11 }, { duration: 1200 }).catch(() => {});
    }
  }, [listo, viveros, seleccionado]);

  return (
    <div className="relative size-full">
      <div ref={contenedor} className="size-full" />
      {(!listo || fallo) && (
        <div className="absolute inset-0 grid place-items-center bg-white p-8 text-center text-marino/60">
          {fallo ? (
            <span>Tu navegador no puede mostrar el mapa. Usa la lista para encontrar tu vivero.</span>
          ) : (
            <span className="animate-pulse">Cargando mapa…</span>
          )}
        </div>
      )}
    </div>
  );
}
