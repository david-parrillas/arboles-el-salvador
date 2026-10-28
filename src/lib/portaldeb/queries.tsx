import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { cargarResumen, type Resumen } from './resumen';

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

/**
 * Datos del build como respaldo inmediato y luego datos frescos del Portal.
 * `enVivo` indica si lo que se muestra ya viene del navegador.
 */
export function useResumen<K extends keyof Resumen>(clave: K, inicial: Resumen[K] | null) {
  const query = useQuery({ queryKey: ['portaldeb', 'resumen'], queryFn: cargarResumen });
  return {
    datos: query.data?.[clave] ?? inicial,
    enVivo: query.isSuccess,
    cargando: query.isFetching,
    error: query.isError,
  };
}
