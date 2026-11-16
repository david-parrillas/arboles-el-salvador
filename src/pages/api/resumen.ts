import { crearProxy, soloGet } from '../../lib/portaldeb/proxy';

export const prerender = false;

export const GET = crearProxy('/arboles/resumen');
export const ALL = soloGet;
