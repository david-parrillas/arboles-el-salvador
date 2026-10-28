# Integración PortalDEB ↔ Árboles para El Salvador

Contexto para desarrollar en PortalDEB (`~/portaldeb/main`, rama base `develop`) lo que
necesita el sitio estático **Árboles para El Salvador**.

## El sitio estático

- Repo: `~/arbolesElSalvador` · GitHub `david-parrillas/arboles-el-salvador`
- Prototipo publicado: https://david-parrillas.github.io/arboles-el-salvador/
- Producción futura: `https://reforestacion.ambiente.gob.sv` (reemplaza el WordPress comprometido)
- Astro 7 estático + islas React 19 + TanStack Query + Zod. Sin base de datos.
- Consume la API pública de PortalDEB en dos momentos:
  1. **Build** (GitHub Actions, en cada push y a diario a las 06:00 SV): datos al HTML.
  2. **Navegador**: las islas refrescan los datos en vivo (CORS).
- Cliente: `src/lib/portaldeb/` (`client.ts`, `schemas.ts`, `resumen.ts`, `queries.tsx`).

## Lo que consume hoy (rutas existentes en `routes/api/viveros.php`)

| Endpoint                                                  | Uso                                                      |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `GET /api/viveros/viveros?withLocation=1`                 | id, nombre, codigo, direccion, ubicacion (GeoJSON Point) |
| `GET /api/viveros/especies/disponibles?visibility=public` | id, nombre_comun, nombre_cientifico                      |
| `GET /api/viveros/inventario`                             | vivero_id, especie_id, cantidad (~230 KB)                |
| Enlace (no API) `/public/viveros/solicitud/form`          | botón "Solicitar árboles"                                |

## Reglas de negocio acordadas

- **No se publican cantidades** de plantas (ni totales ni por vivero/especie). Sí se puede
  publicar qué especies hay, en qué viveros, y en cuántos viveros está cada especie.
- El sitio no menciona PortalDEB en textos visibles (solo afecta al sitio, no a la API).
- Commits y PRs **sin** atribución de Claude (sin `Co-Authored-By`, sin "Generated with Claude Code").

## Trabajo pendiente en PortalDEB (por prioridad)

### 1. Endpoint de disponibilidad sin cantidades — ✅ hecho (sin desplegar)

`GET /api/public/arboles/resumen` devuelve la interfaz `Resumen` del sitio ya armada y sin
cantidades: solo especies públicas, filas con `cantidad > 0`, nombre común cortado en la
primera coma, orden alfabético y sin viveros eliminados. Caché de 10 min
(`Cache::remember` + `Cache-Control: public, max-age=600`), `throttle:30,1`. Pesa ~40 KB
frente a los ~230 KB del inventario.

- **PortalDEB:** rama local `feat/viveros-resumen-publico-arboles` (commit `d2799eea`, desde
  `develop`), sin push ni PR todavía por la migración. Archivos:
  `ResumenPublicoArbolesService`, `ResumenArbolesResource`, `ResumenPublicoArbolesController`,
  `routes/api/public.php` y `tests/Feature/Viveros/ResumenPublicoArbolesTest.php`. Se borró
  `resources/js/modules/viveros/services/getInventario.ts` (no lo importaba nadie).
- **Sitio:** ya lo consume (commit `6a21d8e`). Si responde 404, arma el resumen con las
  3 rutas anteriores, así que el cambio entra solo cuando se despliegue el Portal.

**Pendiente después del despliegue:**

1. Quitar el respaldo de `cargarResumen()` en el sitio (TODO en `src/lib/portaldeb/resumen.ts`).
2. Revisar los logs de acceso del servidor: si nadie más llama a `/api/viveros/inventario`,
   quitar la ruta o ponerla detrás de autenticación. Ninguna pantalla del Portal la usa.
3. `/viveros/{vivero}/inventario`, `/especies/{especie}/inventario` y la de asignaciones
   también muestran `cantidad` sin login; esas sí las usa el Portal, así que hay que
   ponerlas detrás de autenticación sin romper esas pantallas.

### 2. Módulo de jornadas de reforestación (módulo nuevo)

Hoy el calendario del sitio usa datos de ejemplo (`src/data/eventos.ts`). Se crea un
**módulo nuevo** en PortalDEB (según CONVENTIONS: tablas con prefijo del módulo,
softDeletes + userstamps, Service, Policy, permisos Spatie) donde el usuario encargado
programa las jornadas.

**Datos que captura el usuario:**

- **Fecha y hora de inicio** y **fecha y hora de fin** (fin posterior al inicio; zona
  America/El_Salvador).
- **Lugar: una o varias ANP** (Áreas Naturales Protegidas). Relación muchos a muchos con
  el catálogo de ANP existente en PortalDEB (verificar dónde vive ese catálogo y si trae
  ubicación/departamento antes de crear tablas; no duplicarlo).
- **Descripción / mensaje**: el formulario la trae **prellenada con el texto
  predeterminado** y el usuario puede editarla. Se guarda por jornada (si luego cambia el
  texto predeterminado, las jornadas ya creadas no cambian). El texto predeterminado va en
  un solo lugar (constante/config), no repetido en el frontend. Lleva emojis: la columna y
  la conexión deben ser `utf8mb4`.

Texto predeterminado (respetar saltos de párrafo):

```
🌳Esta actividad permitirá incrementar la cobertura vegetal del área, promoviendo entornos más saludables y contribuyendo a la conservación del patrimonio natural.

🦋Los árboles sembrados favorecerán las condiciones necesarias para que las diversas especies de fauna encuentren refugio, alimento y espacios adecuados para su desarrollo.

🌎La participación en estas acciones demuestra el compromiso con la sostenibilidad y el cuidado de los recursos naturales, generando beneficios que perduran en el tiempo.
```

**Endpoint público:** `GET /api/public/arboles/jornadas` → jornadas futuras o en curso
(fin ≥ ahora), ordenadas por inicio, vía API Resource + `Cache::remember`:

```ts
{
  id: number;
  inicio: string; // ISO 8601 con zona, ej. "2026-11-08T07:30:00-06:00"
  fin: string; // ISO 8601 con zona
  // ANP; coordenadas en [lng, lat]
  lugares: Array<{ id: number; nombre: string; departamento: string | null; coordenadas: [number, number] | null }>;
  descripcion: string; // texto plano con saltos de línea; el sitio no interpreta HTML
}
```

**Por definir con el usuario** (no inventar): si la jornada lleva título; si hay estado
borrador/publicada o se publica al guardar; si hay cupos/inscripción; si se puede
cancelar una jornada y cómo se muestra. El calendario del sitio hoy muestra título,
tipo (Jornada/Taller/Entrega) y cupos de ejemplo; se ajustará a lo que se decida.

### 3. Formulario público de voluntariado

El sitio enlaza a `/public/voluntarios/form` (aún no existe). Mismo patrón que el
formulario público de solicitud de árboles (Turnstile, throttle).

### 4. CORS

`config/cors.php` tiene `allowed_origins => ['*']`. Restringir las rutas públicas a:
`https://reforestacion.ambiente.gob.sv`, `https://david-parrillas.github.io` (prototipo),
`http://localhost:4321` (dev). GitHub Actions no necesita CORS (es servidor).

## Notas

- Throttle actual de la API pública: `throttle:30,1`. Suficiente si el resumen va cacheado.
- Dentro de la red MARN, `portaldeb.marn.gob.sv` resuelve a IP privada (192.168.6.137) y
  Chrome pide permiso de "red local" en el sitio. Fuera de la red no pasa. Solución de
  infraestructura: DNS dividido o servir la API bajo el dominio del sitio.
- Cuando exista el endpoint de jornadas, el calendario del sitio pasa de `eventosEjemplo`
  a la API (schema Zod en `schemas.ts`, datos en el build y refresco en una isla).
