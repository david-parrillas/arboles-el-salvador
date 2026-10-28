import { z } from 'zod';
import { PORTALDEB_URL } from '../../config/site';
import { departamentoSchema, especieSchema, inventarioSchema, viveroSchema } from './schemas';

export class PortalDebError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'PortalDebError';
  }
}

async function get<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  const res = await fetch(`${PORTALDEB_URL}/api${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new PortalDebError(`PortalDEB respondió ${res.status} en ${path}`, res.status);
  }
  return schema.parse(await res.json());
}

export const portaldeb = {
  viveros: () => get('/viveros/viveros?withLocation=1', z.array(viveroSchema)),
  especiesDisponibles: () => get('/viveros/especies/disponibles?visibility=public', z.array(especieSchema)),
  inventario: () => get('/viveros/inventario', z.array(inventarioSchema)),
  departamentos: () =>
    get('/territorios/departamentos', z.object({ data: z.array(departamentoSchema) })).then((r) => r.data),
};
