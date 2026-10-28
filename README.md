# Árboles para El Salvador

Sitio estático (prototipo) que reemplaza al WordPress de `reforestacion.ambiente.gob.sv`.
No tiene base de datos: los datos vienen de la API pública de **PortalDEB**.

## Stack

- **Astro 7** (`output: 'static'`) + islas **React 19**
- **TailwindCSS 4** (tema en `src/styles/global.css`)
- **TanStack Query** + **Zod** para consumir y validar la API
- **Motion** para animaciones
- **ArcGIS JS 4.34** (misma versión que PortalDEB), se carga solo al llegar al mapa

Requiere Node ≥ 22.23 (`nvm use` lee `.nvmrc`) y pnpm.

```bash
nvm use
pnpm install
cp .env.example .env
pnpm dev        # desarrollo
pnpm check      # tipos
pnpm build      # genera dist/
pnpm preview    # sirve dist/
```

## Flujo de trabajo

- Rama principal: `main` (protegida, solo por PR con CI en verde).
- Ramas: `feat/…`, `fix/…`, `docs/…`; commits en español con [Conventional Commits](https://www.conventionalcommits.org/es/).
- Antes de abrir un PR: `pnpm format && pnpm check && pnpm build`.
- CI (`.github/workflows/ci.yml`) valida formato, tipos y build en cada PR.
- La URL de PortalDEB se puede sobrescribir en GitHub con la variable de repositorio `PUBLIC_PORTALDEB_URL`.

## Cómo llegan los datos

1. **En el build:** `src/pages/index.astro` llama a `cargarResumenSeguro()`, que consulta PortalDEB y escribe
   los datos en el HTML (SEO y respaldo). Si el Portal no responde, la página se genera igual.
2. **En el navegador:** las islas (`src/components/islands/`) refrescan los datos con TanStack Query y
   comparten una sola petición (`src/lib/portaldeb/queries.tsx`).

| Endpoint PortalDEB                                        | Uso                              |
| --------------------------------------------------------- | -------------------------------- |
| `GET /api/viveros/viveros?withLocation=1`                 | Mapa y lista de viveros          |
| `GET /api/viveros/especies/disponibles?visibility=public` | Catálogo de especies             |
| `GET /api/viveros/inventario`                             | Existencias por especie y vivero |

## Pendiente en PortalDEB

- Módulo de jornadas/eventos → hoy `src/data/eventos.ts` tiene **datos de ejemplo**.
- Endpoint de estadísticas agregadas (evita descargar el inventario completo, ~230 KB).
- Formulario público de voluntarios (`enlaces.voluntarios` en `src/config/site.ts`).
- Limitar `allowed_origins` en `config/cors.php` al dominio de este sitio.
