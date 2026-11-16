// Formularios públicos del Portal (enlaces, no API). La URL de la API y el token viven
// en astro:env/server (PORTALDEB_URL, PORTALDEB_TOKEN) y este archivo no debe importarlos:
// lo usan también las islas.
const PORTAL_PUBLICO = 'https://portaldeb.marn.gob.sv';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ruta interna que respeta `base` (el sitio puede servirse desde una subcarpeta). */
export function ruta(path = '') {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

/** Mientras sea prototipo: aviso visible y `noindex`. Poner PUBLIC_PROTOTIPO=false en producción. */
export const esPrototipo = import.meta.env.PUBLIC_PROTOTIPO !== 'false';

export const enlaces = {
  solicitudArboles: `${PORTAL_PUBLICO}/public/viveros/solicitud/form`,
  // TODO: el formulario de voluntarios aún no existe en PortalDEB.
  voluntarios: `${PORTAL_PUBLICO}/public/voluntarios/form`,
  guiaReforestacion: ruta('docs/guia-reforestacion.pdf'),
} as const;

export const navegacion = [
  { href: '#proyecto', label: 'El proyecto' },
  { href: '#especies', label: 'Especies' },
  { href: '#viveros', label: 'Viveros' },
] as const;
