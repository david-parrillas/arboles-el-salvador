/** Minúsculas y sin tildes, para búsquedas tolerantes ("arrayan" encuentra "Arrayán"). */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export const numero = new Intl.NumberFormat('es-SV');
