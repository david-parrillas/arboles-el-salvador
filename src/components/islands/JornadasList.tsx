import { useEffect, useState } from 'react';
import type { Jornadas } from '../../lib/portaldeb/jornadas';
import { useJornadas, withQuery } from '../../lib/portaldeb/queries';

const zona = { timeZone: 'America/El_Salvador' } as const;
const dia = new Intl.DateTimeFormat('es-SV', { ...zona, day: '2-digit' });
const mes = new Intl.DateTimeFormat('es-SV', { ...zona, month: 'short' });
// formatRange junta lo que se repite: "8 de noviembre, 7:30 a. m. – 12:00 p. m."
const rango = new Intl.DateTimeFormat('es-SV', {
  ...zona,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

// Node y los navegadores no usan los mismos espacios especiales (estrechos, finos) al
// formatear fechas; se igualan para que el HTML del build coincida al hidratar.
function rangoFechas(inicio: Date, fin: Date) {
  return rango.formatRange(inicio, fin).replace(/[\u00a0\u2009\u202f]/g, ' ');
}

interface Props {
  inicial: Jornadas | null;
}

function JornadasList({ inicial }: Props) {
  const { datos, cargando } = useJornadas(inicial);
  // El HTML se generó en el build; las jornadas que ya terminaron se quitan
  // después de hidratar para no romper la hidratación.
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => setAhora(Date.now()), []);

  const jornadas = (datos?.lista ?? []).filter((j) => ahora === null || Date.parse(j.fin) >= ahora);

  return (
    <div className="mt-14">
      {datos?.ejemplo && (
        <p className="mb-8 max-w-sm rounded-2xl border-2 border-dashed border-marino/20 px-4 py-3 text-sm text-marino/75">
          <strong>Datos de ejemplo.</strong> Pronto publicaremos aquí las jornadas reales.
        </p>
      )}

      {jornadas.length === 0 ? (
        <p className="rounded-[1.75rem] border-2 border-dashed border-marino/20 p-10 text-center text-marino/70">
          {datos || !cargando
            ? 'Por ahora no hay jornadas programadas. Vuelve pronto.'
            : 'Cargando las próximas jornadas…'}
        </p>
      ) : (
        <ul className="divide-y divide-marino/10 border-y border-marino/10">
          {jornadas.map((j) => {
            const inicio = new Date(j.inicio);
            return (
              <li
                key={j.id}
                className="group grid grid-cols-[auto_1fr] gap-x-6 py-8 md:grid-cols-[8rem_1fr] md:gap-x-10"
              >
                <div className="grid size-24 place-content-center rounded-3xl bg-rosa text-center transition group-hover:-rotate-3 md:size-32">
                  <p className="text-5xl titulo md:text-6xl">{dia.format(inicio)}</p>
                  <p className="mt-1 eyebrow">{mes.format(inicio).replace('.', '')}</p>
                </div>
                <div className="min-w-0">
                  <h3 className="text-3xl titulo text-balance transition group-hover:translate-x-2 md:text-4xl">
                    {j.titulo}
                  </h3>
                  <p className="mt-2 font-semibold text-olivo first-letter:uppercase">
                    {rangoFechas(inicio, new Date(j.fin))}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Lugares">
                    {j.lugares.map((l) => (
                      <li
                        key={l.id}
                        className="flex items-center gap-1.5 rounded-full bg-verde-50 px-3 py-1.5 text-sm text-marino"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4 shrink-0 text-verde"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                        </svg>
                        <span>
                          <strong className="font-semibold">{l.nombre}</strong>
                          {l.departamento && <span className="text-marino/70"> · {l.departamento}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {j.descripcion.trim() && (
                    <details className="group/detalle mt-4">
                      <summary className="w-fit cursor-pointer list-none rounded-full font-semibold text-olivo underline decoration-pasto decoration-2 underline-offset-4 hover:decoration-olivo [&::-webkit-details-marker]:hidden">
                        <span className="group-open/detalle:hidden">Ver más sobre la jornada</span>
                        <span className="hidden group-open/detalle:inline">Ver menos</span>
                      </summary>
                      <p className="mt-3 max-w-3xl leading-relaxed whitespace-pre-line text-marino/80">
                        {j.descripcion}
                      </p>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default withQuery(JornadasList);
