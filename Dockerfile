# syntax=docker/dockerfile:1.7
# Imagen para Cloud Run: páginas prerenderizadas + proxy /api/* con el token de PortalDEB.
#
#   docker build --secret id=portaldeb_token,env=PORTALDEB_TOKEN -t arboles .
#   docker run -p 8080:8080 -e PORTALDEB_TOKEN arboles
#
# El token entra al build como secreto de BuildKit: no queda en capas, historial ni en la imagen final.

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
ARG PORTALDEB_URL=https://portaldeb.marn.gob.sv
ARG SITE_URL
ARG PUBLIC_PROTOTIPO
ENV PORTALDEB_URL=${PORTALDEB_URL} SITE_URL=${SITE_URL} PUBLIC_PROTOTIPO=${PUBLIC_PROTOTIPO}
RUN --mount=type=secret,id=portaldeb_token,required=true \
    PORTALDEB_TOKEN="$(cat /run/secrets/portaldeb_token)" pnpm build

FROM node:${NODE_VERSION}-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 8080
# Cloud Run define PORT; PORTALDEB_URL y PORTALDEB_TOKEN se inyectan en el servicio.
CMD ["node", "./dist/server/entry.mjs"]
