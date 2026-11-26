import { z } from 'zod';

const territorio = z.object({ id: z.number(), nombre: z.string() });

// Solo se declaran los campos que usa el sitio: zod descarta el resto,
// así una columna nueva en el modelo del Portal nunca llega a la página.

// GET /api/arboles/resumen: disponibilidad ya resumida y sin cantidades.
export const resumenSchema = z.object({
  generadoEn: z.string(),
  totales: z.object({ especies: z.number(), viveros: z.number() }),
  especies: z.array(
    z.object({
      id: z.number(),
      nombreComun: z.string(),
      nombreCientifico: z.string().nullable(),
      // Opcional hasta que el Portal lo envíe en todos los entornos.
      uso: z
        .object({ id: z.number(), nombre: z.string() })
        .nullish()
        .transform((u) => u ?? null),
      viveros: z.number(),
    }),
  ),
  viveros: z.array(
    z.object({
      id: z.number(),
      nombre: z.string(),
      direccion: z.string().nullable(),
      coordenadas: z.tuple([z.number(), z.number()]).nullable(),
      // División territorial 2024. Opcional hasta que el Portal la envíe en todos los entornos.
      ubicacion: z
        .object({ departamento: territorio, municipio: territorio, distrito: territorio })
        .nullish()
        .transform((u) => u ?? null),
      especies: z.array(z.string()),
    }),
  ),
});

// GET /api/arboles/jornadas: jornadas futuras o en curso (las canceladas no vienen).
export const jornadaSchema = z.object({
  id: z.number(),
  titulo: z.string(),
  inicio: z.string(), // ISO 8601 con zona
  fin: z.string(),
  lugares: z.array(
    z.object({
      id: z.number(),
      nombre: z.string(),
      departamento: z.string().nullable(),
      coordenadas: z.tuple([z.number(), z.number()]).nullable(),
    }),
  ),
  descripcion: z.string(),
});

export type Jornada = z.infer<typeof jornadaSchema>;
