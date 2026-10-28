import { useDeferredValue, useMemo, useState } from 'react';
import { enlaces } from '../../config/site';
import { useResumen, withQuery } from '../../lib/portaldeb/queries';
import type { ResumenVivero } from '../../lib/portaldeb/resumen';
import { normalizar, numero } from '../../lib/texto';
import ViverosMap from './ViverosMap';

interface Props {
  inicial: ResumenVivero[] | null;
}

// Los nombres vienen como "Vivero ANP Tacuba, Ahuachapán MARN": se limpian para la tarjeta.
function nombreCorto(nombre: string) {
  return nombre.replace(/^Vivero\s+/i, '').replace(/\s+MARN$/i, '');
}

function ViverosExplorer({ inicial }: Props) {
  const { datos } = useResumen('viveros', inicial);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const termino = useDeferredValue(normalizar(busqueda.trim()));

  const viveros = datos ?? [];
  const filtrados = useMemo(
    () => viveros.filter((v) => !termino || normalizar(`${v.nombre} ${v.direccion ?? ''}`).includes(termino)),
    [viveros, termino],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="order-2 flex flex-col rounded-[2rem] bg-white p-3 ring-1 ring-marino/10 lg:order-1 lg:h-[640px]">
        <label className="block p-2">
          <span className="sr-only">Buscar vivero</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Busca por municipio o departamento…"
            className="w-full rounded-full border border-marino/15 bg-crema px-5 py-3.5 text-marino placeholder:text-marino/40 focus:border-hoja-700 focus:outline-none"
          />
        </label>
        <ul className="max-h-[420px] flex-1 [scrollbar-color:var(--color-salvia-300)_transparent] space-y-1.5 overflow-y-auto p-2 lg:max-h-none">
          {filtrados.map((v) => {
            const activo = v.id === seleccionado;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setSeleccionado(activo ? null : v.id)}
                  aria-expanded={activo}
                  className={`w-full rounded-3xl px-5 py-4 text-left transition ${
                    activo ? 'bg-rosa text-marino' : 'hover:bg-hoja-100'
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-bold">{nombreCorto(v.nombre)}</span>
                    <span
                      className={`shrink-0 text-sm tabular-nums ${activo ? 'text-marino/70' : 'font-semibold text-hoja-700'}`}
                    >
                      {v.total > 0 ? numero.format(v.total) : '—'}
                    </span>
                  </span>
                  {activo && (
                    <span className="mt-3 block">
                      {v.direccion && <span className="block text-sm text-marino/75">{v.direccion}</span>}
                      <span className="mt-3 flex flex-wrap gap-1.5">
                        {v.destacadas.map((d) => (
                          <span key={d.nombre} className="rounded-full bg-marino/10 px-3 py-1 text-xs font-semibold">
                            {d.nombre.split(',')[0]} · {numero.format(d.cantidad)}
                          </span>
                        ))}
                      </span>
                      <span className="mt-3 block text-xs text-marino/70">
                        {v.especies} especies disponibles
                        {!v.coordenadas && ' · sin ubicación en el mapa'}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {filtrados.length === 0 && (
            <li className="p-6 text-center text-marino/60">
              {datos ? 'Ningún vivero coincide con la búsqueda.' : 'No se pudo cargar la lista de viveros.'}
            </li>
          )}
        </ul>
        <a
          href={enlaces.solicitudArboles}
          className="m-2 rounded-full bg-hoja-700 px-6 py-4 text-center font-bold text-white transition hover:bg-hoja-800"
        >
          Solicitar árboles de un vivero ↗
        </a>
      </div>

      <div className="order-1 h-[60vh] min-h-[360px] overflow-hidden rounded-[2rem] ring-1 ring-marino/10 lg:order-2 lg:h-[640px]">
        <ViverosMap viveros={viveros} seleccionado={seleccionado} onSeleccionar={setSeleccionado} />
      </div>
    </div>
  );
}

export default withQuery(ViverosExplorer);
