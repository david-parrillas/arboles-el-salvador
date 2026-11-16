import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ComponentType } from 'react';
import { z } from 'zod';
import { ruta } from '../../config/site';
import type { Jornadas } from './jornadas';
import type { Resumen } from './resumen';
import { jornadaSchema, resumenSchema } from './schemas';

// Las islas piden al proxy del mismo origen (src/pages/api/), nunca al Portal:
// el token solo existe en el servidor.
async function pedir<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  const res = await fetch(ruta(path), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${path} respondió ${res.status}`);
  return schema.parse(await res.json());
}

const cargarResumen = () => pedir('api/resumen', resumenSchema);
const cargarJornadas = async (): Promise<Jornadas> => ({
  lista: await pedir('api/jornadas', z.array(jornadaSchema)),
  ejemplo: false,
});

// Cada isla de Astro es una raíz de React distinta, pero este módulo se
// comparte entre ellas: todas usan la misma caché y el mismo fetch.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export function withQuery<P extends object>(Component: ComponentType<P>) {
  return function ConQuery(props: P) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    );
  };
}

// En el primer render del navegador la consulta ya está en curso, pero el HTML del
// build se generó sin ese estado: se ignora hasta hidratar para que coincidan.
function useHidratado() {
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);
  return hidratado;
}

/**
 * Datos del build como respaldo inmediato y luego datos frescos del Portal.
 * `enVivo` indica si lo que se muestra ya viene del navegador.
 */
export function useResumen<K extends keyof Resumen>(clave: K, inicial: Resumen[K] | null) {
  const query = useQuery({ queryKey: ['portaldeb', 'resumen'], queryFn: cargarResumen });
  const hidratado = useHidratado();
  return {
    datos: query.data?.[clave] ?? inicial,
    enVivo: query.isSuccess,
    cargando: hidratado && query.isFetching,
    error: query.isError,
  };
}

/** Igual que useResumen, para el calendario de jornadas. */
export function useJornadas(inicial: Jornadas | null) {
  const query = useQuery({ queryKey: ['portaldeb', 'jornadas'], queryFn: cargarJornadas });
  const hidratado = useHidratado();
  return { datos: query.data ?? inicial, cargando: hidratado && query.isFetching };
}
