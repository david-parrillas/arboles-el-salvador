// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL y BASE_PATH permiten publicar en una subruta (p. ej. GitHub Pages: /arboles-el-salvador).
// Sin definirlas, el sitio se genera para la raíz del dominio definitivo.
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://reforestacion.ambiente.gob.sv',
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
