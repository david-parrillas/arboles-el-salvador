import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { useResumen, withQuery } from '../../lib/portaldeb/queries';
import type { ResumenVivero, Territorio, Ubicacion } from '../../lib/portaldeb/resumen';
import { normalizar } from '../../lib/texto';
import ViverosMap from './ViverosMap';

interface Props {
  inicial: ResumenVivero[] | null;
}

// Los nombres vienen como "Vivero ANP Tacuba, Ahuachapán MARN": se limpian para la tarjeta.
function nombreCorto(nombre: string) {
  return nombre.replace(/^Vivero\s+/i, '').replace(/\s+MARN$/i, '');
}

type Nivel = keyof Ubicacion;

/** Territorios distintos de un nivel, ordenados por nombre, entre los viveros dados. */
function opciones(viveros: ResumenVivero[], nivel: Nivel): Territorio[] {
  const unicos = new Map<number, Territorio>();
  for (const v of viveros) if (v.ubicacion) unicos.set(v.ubicacion[nivel].id, v.ubicacion[nivel]);
  return [...unicos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** "Distrito, Municipio, Departamento" para mostrar y buscar. */
function territorios(v: ResumenVivero) {
  const u = v.ubicacion;
  return u ? `${u.distrito.nombre}, ${u.municipio.nombre}, ${u.departamento.nombre}` : '';
}

function coincide(v: ResumenVivero, nivel: Nivel, id: number | null) {
  return id === null || v.ubicacion?.[nivel].id === id;
}

function Selector(props: {
  etiqueta: string;
  todos: string;
  valor: number | null;
  opciones: Territorio[];
  onCambiar: (id: number | null) => void;
  deshabilitado?: boolean;
}) {
  return (
    <label className="block flex-1">
      <span className="mb-1.5 block text-sm font-semibold text-marino/70">{props.etiqueta}</span>
      <select
        value={props.valor ?? ''}
        disabled={props.deshabilitado}
        onChange={(e) => props.onCambiar(e.target.value ? Number(e.target.value) : null)}
        className="w-full cursor-pointer rounded-full border border-marino/15 bg-white px-5 py-3.5 text-marino focus:border-olivo focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{props.todos}</option>
        {props.opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}

function ViverosExplorer({ inicial }: Props) {
  const { datos } = useResumen('viveros', inicial);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [departamento, setDepartamento] = useState<number | null>(null);
  const [municipio, setMunicipio] = useState<number | null>(null);
  const [distrito, setDistrito] = useState<number | null>(null);
  const termino = useDeferredValue(normalizar(busqueda.trim()));
  const mapa = useRef<HTMLDivElement>(null);

  const viveros = datos ?? [];
  const conUbicacion = viveros.some((v) => v.ubicacion);

  // Cada selector solo ofrece territorios que tienen viveros dentro del nivel superior elegido.
  const departamentos = useMemo(() => opciones(viveros, 'departamento'), [viveros]);
  const municipios = useMemo(
    () =>
      opciones(
        viveros.filter((v) => coincide(v, 'departamento', departamento)),
        'municipio',
      ),
    [viveros, departamento],
  );
  const distritos = useMemo(
    () =>
      opciones(
        viveros.filter((v) => coincide(v, 'municipio', municipio)),
        'distrito',
      ),
    [viveros, municipio],
  );

  const filtrados = useMemo(
    () =>
      viveros.filter(
        (v) =>
          coincide(v, 'departamento', departamento) &&
          coincide(v, 'municipio', municipio) &&
          coincide(v, 'distrito', distrito) &&
          (!termino || normalizar(`${v.nombre} ${v.direccion ?? ''} ${territorios(v)}`).includes(termino)),
      ),
    [viveros, departamento, municipio, distrito, termino],
  );

  const hayFiltros = departamento !== null || busqueda !== '';
  function limpiar() {
    setDepartamento(null);
    setMunicipio(null);
    setDistrito(null);
    setBusqueda('');
  }

  function verEnMapa(v: ResumenVivero) {
    setSeleccionado(v.id);
    if (v.coordenadas) mapa.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div>
      <div
        ref={mapa}
        className="mx-auto h-[65vh] min-h-[380px] overflow-hidden rounded-[2rem] ring-1 ring-marino/10 lg:h-[680px]"
      >
        <ViverosMap viveros={filtrados} seleccionado={seleccionado} onSeleccionar={setSeleccionado} />
      </div>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="text-3xl titulo">Viveros del MARN</h3>
        <p className="text-sm text-marino/60" aria-live="polite">
          {filtrados.length} {filtrados.length === 1 ? 'vivero' : 'viveros'}
          {hayFiltros && (
            <button type="button" onClick={limpiar} className="ml-3 font-semibold text-olivo hover:underline">
              Limpiar filtros
            </button>
          )}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end">
        {conUbicacion && (
          <>
            <Selector
              etiqueta="Departamento"
              todos="Todos los departamentos"
              valor={departamento}
              opciones={departamentos}
              onCambiar={(id) => {
                setDepartamento(id);
                setMunicipio(null);
                setDistrito(null);
              }}
            />
            <Selector
              etiqueta="Municipio"
              todos="Todos los municipios"
              valor={municipio}
              opciones={municipios}
              deshabilitado={departamento === null}
              onCambiar={(id) => {
                setMunicipio(id);
                setDistrito(null);
              }}
            />
            <Selector
              etiqueta="Distrito"
              todos="Todos los distritos"
              valor={distrito}
              opciones={distritos}
              deshabilitado={municipio === null}
              onCambiar={setDistrito}
            />
          </>
        )}
        <label className="block flex-1">
          <span className="mb-1.5 block text-sm font-semibold text-marino/70">Buscar</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={conUbicacion ? 'Nombre del vivero…' : 'Busca por municipio o departamento…'}
            className="w-full rounded-full border border-marino/15 bg-white px-5 py-3.5 text-marino placeholder:text-marino/40 focus:border-olivo focus:outline-none"
          />
        </label>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((v) => {
          const activo = v.id === seleccionado;
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => verEnMapa(v)}
                aria-pressed={activo}
                className={`flex h-full w-full flex-col rounded-3xl px-5 py-4 text-left ring-1 transition ${
                  activo ? 'bg-rosa ring-rosa-400' : 'bg-white ring-marino/10 hover:bg-verde-50'
                }`}
              >
                <span className="font-bold text-marino">{nombreCorto(v.nombre)}</span>
                <span className="mt-1 text-sm text-marino/70">{v.direccion ?? 'Dirección no disponible'}</span>
                {v.ubicacion && <span className="mt-2 text-xs font-semibold text-olivo">{territorios(v)}</span>}
                {!v.coordenadas && <span className="mt-2 text-xs text-marino/60">Sin ubicación en el mapa</span>}
              </button>
            </li>
          );
        })}
        {filtrados.length === 0 && (
          <li className="col-span-full rounded-3xl border-2 border-dashed border-marino/20 p-8 text-center text-marino/60">
            {datos ? 'Ningún vivero coincide con la búsqueda.' : 'No se pudo cargar la lista de viveros.'}
          </li>
        )}
      </ul>
    </div>
  );
}

export default withQuery(ViverosExplorer);
