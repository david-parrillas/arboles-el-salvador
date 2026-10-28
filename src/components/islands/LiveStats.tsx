import { animate, useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useResumen, withQuery } from '../../lib/portaldeb/queries';
import type { Resumen } from '../../lib/portaldeb/resumen';

const numero = new Intl.NumberFormat('es-SV');
const hora = new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium', timeStyle: 'short' });

function Contador({ valor }: { valor: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const [mostrado, setMostrado] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    if (!visible) return;
    const control = animate(anterior.current, valor, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setMostrado(Math.round(v)),
    });
    anterior.current = valor;
    return () => control.stop();
  }, [visible, valor]);

  return (
    <span ref={ref} className="tabular-nums">
      {numero.format(mostrado)}
    </span>
  );
}

interface Props {
  inicial: Resumen['totales'] | null;
  generadoEn: string | null;
}

function LiveStats({ inicial, generadoEn }: Props) {
  const { datos, enVivo, error } = useResumen('totales', inicial);
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    if (enVivo) setAhora(new Date());
  }, [enVivo]);

  // No se publican cantidades de plantas: solo cuántas especies y viveros hay.
  const tarjetas: { valor?: number; texto?: string; etiqueta: string; acento: string }[] = [
    { valor: datos?.especies, etiqueta: 'especies disponibles', acento: 'bg-verde' },
    { valor: datos?.viveros, etiqueta: 'viveros en todo el país', acento: 'bg-rosa-400' },
    { texto: 'Gratis', etiqueta: 'para quien se comprometa a sembrar', acento: 'bg-pasto' },
  ];

  return (
    <div className="rounded-[2rem] border border-marino/10 bg-white/70 p-2 shadow-[0_20px_60px_-30px_rgb(39_41_92/0.35)] backdrop-blur-xl">
      <dl className="grid gap-2 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <div key={t.etiqueta} className="relative overflow-hidden rounded-3xl bg-white px-6 py-5">
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${t.acento}`} />
            <dt className="text-sm text-marino/70">{t.etiqueta}</dt>
            <dd className="mt-2 text-5xl titulo text-marino md:text-6xl">
              {t.texto ?? (t.valor == null ? '—' : <Contador valor={t.valor} />)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="flex flex-wrap items-center gap-x-2 px-5 pt-3 pb-2 text-xs text-marino/60">
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${enVivo ? 'animate-pulso bg-verde' : error ? 'bg-pasto' : 'bg-marino/30'}`}
        />
        {enVivo && ahora
          ? `Actualizado: ${hora.format(ahora)}`
          : error
            ? generadoEn
              ? `Datos al ${hora.format(new Date(generadoEn))}`
              : 'Información no disponible por el momento'
            : generadoEn
              ? `Datos al ${hora.format(new Date(generadoEn))} · actualizando…`
              : 'Actualizando…'}
      </p>
    </div>
  );
}

export default withQuery(LiveStats);
