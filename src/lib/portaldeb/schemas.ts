import { z } from 'zod';

// Solo se declaran los campos que usa el sitio: zod descarta el resto,
// así una columna nueva en el modelo del Portal nunca llega a la página.

export const puntoSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const viveroSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  codigo: z.string().nullable(),
  direccion: z.string().nullable(),
  ubicacion: puntoSchema.nullable(),
});

export const especieSchema = z.object({
  id: z.number(),
  nombre_comun: z.string(),
  nombre_cientifico: z.string().nullable(),
});

export const inventarioSchema = z.object({
  vivero_id: z.number(),
  especie_id: z.number(),
  cantidad: z.coerce.number(),
});

export const departamentoSchema = z.object({
  id: z.number(),
  title: z.string(),
  code: z.string(),
});

export type Vivero = z.infer<typeof viveroSchema>;
export type Especie = z.infer<typeof especieSchema>;
export type Inventario = z.infer<typeof inventarioSchema>;
export type Departamento = z.infer<typeof departamentoSchema>;
