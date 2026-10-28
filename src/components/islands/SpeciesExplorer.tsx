import { AnimatePresence, motion } from 'motion/react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useResumen, withQuery } from '../../lib/portaldeb/queries';
import type { ResumenEspecie } from '../../lib/portaldeb/resumen';
import { normalizar, numero } from '../../lib/texto';

const POR_PAGINA = 12;
const acentos = ['bg-verde', 'bg-rosa-400', 'bg-pasto'];

interface Props {
  inicial: ResumenEspecie[] | null;
}

function SpeciesExplorer({ inicial }: Props) {
  const { datos, cargando } = useResumen('especies', inicial);
  const [busqueda, setBusqueda] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [limite, setLimite] = useState(POR_PAGINA);
  const termino = useDeferredValue(normalizar(busqueda.trim()));

  const especies = datos ?? [];

  const filtradas = useMemo(
    () =>
      especies.filter(
        (e) =>
          (!soloDisponibles || e.viveros > 0) &&
          (!termino ||
            normalizar(e.nombreComun).includes(termino) ||
            normalizar(e.nombreCientifico ?? '').includes(termino)),
      ),
    [especies, soloDisponibles, termino],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar especie</span>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-marino/50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setLimite(POR_PAGINA);
            }}
            placeholder="Busca por nombre común o científico: cedro, Swietenia…"
            className="w-full rounded-full border-2 border-marino/15 bg-white py-4 pr-5 pl-13 text-lg text-marino placeholder:text-marino/40 focus:border-olivo focus:outline-none"
          />
        </label>
        <button
          type="button"
          aria-pressed={soloDisponibles}
          onClick={() => setSoloDisponibles((v) => !v)}
          className={`rounded-full border-2 px-6 py-4 font-semibold transition ${
            soloDisponibles
              ? 'border-olivo bg-olivo text-white'
              : 'border-marino/15 bg-white text-marino hover:border-marino'
          }`}
        >
          {soloDisponibles ? '✓ Solo disponibles' : 'Todas las especies'}
        </button>
      </div>

      <p className="mt-4 text-sm text-marino/60" aria-live="polite">
        {numero.format(filtradas.length)} especies {cargando && '· actualizando catálogo…'}
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence initial={false} mode="popLayout">
          {filtradas.slice(0, limite).map((e, i) => (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col rounded-[1.75rem] bg-white p-6 ring-1 ring-marino/10"
            >
              <span aria-hidden="true" className={`mb-4 size-3 rounded-full ${acentos[i % acentos.length]}`} />
              <h3 className="text-xl leading-tight font-bold text-balance text-marino">{e.nombreComun}</h3>
              {e.nombreCientifico && (
                <p className="mt-1 font-serif text-lg text-marino/60 italic">{e.nombreCientifico}</p>
              )}
              <div className="mt-auto pt-6">
                <p
                  className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${
                    e.viveros > 0 ? 'bg-verde-50 text-olivo' : 'bg-marino/5 text-marino/60'
                  }`}
                >
                  {e.viveros > 0
                    ? `Disponible en ${e.viveros} ${e.viveros === 1 ? 'vivero' : 'viveros'}`
                    : 'Sin existencias por ahora'}
                </p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {filtradas.length === 0 && (
        <p className="rounded-[1.75rem] border-2 border-dashed border-marino/20 p-10 text-center text-marino/60">
          {datos
            ? `No encontramos “${busqueda}”. Prueba con otro nombre.`
            : 'No se pudo cargar el catálogo de especies.'}
        </p>
      )}

      {filtradas.length > limite && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setLimite((l) => l + POR_PAGINA * 2)}
            className="rounded-full border-2 border-marino px-8 py-4 font-bold text-marino transition hover:bg-marino hover:text-white"
          >
            Ver más especies ({numero.format(filtradas.length - limite)})
          </button>
        </div>
      )}
    </div>
  );
}

export default withQuery(SpeciesExplorer);
