// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL y BASE_PATH permiten publicar en una subruta (p. ej. GitHub Pages: /arboles-el-salvador).
// Sin definirlas, el sitio se genera para la raíz del dominio definitivo.
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://reforestacion.ambiente.gob.sv',
  base: process.env.BASE_PATH ?? '/',
  // Las páginas siguen prerenderizadas; solo src/pages/api/* corre en el servidor (prerender = false).
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  env: {
    // Solo servidor: se leen de process.env en el build y en Cloud Run, nunca llegan al navegador.
    schema: {
      PORTALDEB_URL: envField.string({
        context: 'server',
        access: 'secret',
        url: true,
        default: 'https://portaldeb.marn.gob.sv',
      }),
      // Opcional para poder trabajar en local sin token: en dev se usan los datos de ejemplo
      // de src/data/; en el build de producción su ausencia hace fallar (ver servidor.ts).
      PORTALDEB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
