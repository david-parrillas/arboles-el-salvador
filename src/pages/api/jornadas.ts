import { crearProxy, soloGet } from '../../lib/portaldeb/proxy';

export const prerender = false;

export const GET = crearProxy('/arboles/jornadas');
export const ALL = soloGet;
