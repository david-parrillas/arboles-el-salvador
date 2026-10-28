export const PORTALDEB_URL = (import.meta.env.PUBLIC_PORTALDEB_URL ?? 'https://portaldeb.marn.gob.sv').replace(
  /\/$/,
  '',
);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ruta interna que respeta `base` (el sitio puede servirse desde una subcarpeta). */
export function ruta(path = '') {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

/** Mientras sea prototipo: aviso visible y `noindex`. Poner PUBLIC_PROTOTIPO=false en producción. */
export const esPrototipo = import.meta.env.PUBLIC_PROTOTIPO !== 'false';

export const enlaces = {
  solicitudArboles: `${PORTALDEB_URL}/public/viveros/solicitud/form`,
  // TODO: el formulario de voluntarios aún no existe en PortalDEB.
  voluntarios: `${PORTALDEB_URL}/public/voluntarios/form`,
  guiaReforestacion: ruta('docs/guia-reforestacion.pdf'),
} as const;

export const navegacion = [
  { href: '#proyecto', label: 'El proyecto' },
  { href: '#especies', label: 'Especies' },
  { href: '#viveros', label: 'Viveros' },
  { href: '#calendario', label: 'Calendario' },
  { href: '#voluntariado', label: 'Voluntariado' },
] as const;
