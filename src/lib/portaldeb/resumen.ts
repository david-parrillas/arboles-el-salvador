// GET /api/arboles/resumen: disponibilidad ya resumida y sin cantidades.

export interface ResumenEspecie {
  id: number;
  nombreComun: string;
  nombreCientifico: string | null;
  /** En cuántos viveros está disponible (0 = sin existencias por ahora). */
  viveros: number;
}

export interface Territorio {
  id: number;
  nombre: string;
}

/** División territorial vigente desde 2024: 14 departamentos, 44 municipios y 262 distritos. */
export interface Ubicacion {
  departamento: Territorio;
  municipio: Territorio;
  distrito: Territorio;
}

export interface ResumenVivero {
  id: number;
  nombre: string;
  direccion: string | null;
  coordenadas: [number, number] | null;
  ubicacion: Ubicacion | null;
  /** Nombres comunes de las especies disponibles, en orden alfabético. */
  especies: string[];
}

export interface Resumen {
  generadoEn: string;
  totales: {
    especies: number;
    viveros: number;
  };
  especies: ResumenEspecie[];
  viveros: ResumenVivero[];
}
