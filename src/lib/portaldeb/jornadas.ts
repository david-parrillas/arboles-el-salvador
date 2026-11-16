import type { Jornada } from './schemas';

export type { Jornada };

export interface Jornadas {
  lista: Jornada[];
  /** true mientras el endpoint no esté desplegado y se muestran datos de ejemplo. */
  ejemplo: boolean;
}
