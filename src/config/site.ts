export const PORTALDEB_URL = (import.meta.env.PUBLIC_PORTALDEB_URL ?? 'https://portaldeb.marn.gob.sv').replace(
  /\/$/,
  '',
);

export const enlaces = {
  solicitudArboles: `${PORTALDEB_URL}/public/viveros/solicitud/form`,
  // TODO: el formulario de voluntarios aún no existe en PortalDEB.
  voluntarios: `${PORTALDEB_URL}/public/voluntarios/form`,
  guiaReforestacion: '/docs/guia-reforestacion.pdf',
} as const;

export const navegacion = [
  { href: '#proyecto', label: 'El proyecto' },
  { href: '#especies', label: 'Especies' },
  { href: '#viveros', label: 'Viveros' },
  { href: '#calendario', label: 'Calendario' },
  { href: '#voluntariado', label: 'Voluntariado' },
] as const;
