FROM node:22-bookworm AS build

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api/v1
ARG NEXT_PUBLIC_MAPBOX_TOKEN=
ARG NEXT_PUBLIC_OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
ENV NEXT_PUBLIC_OPEN_METEO_API_URL=${NEXT_PUBLIC_OPEN_METEO_API_URL}

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/web apps/web

RUN pnpm --filter @foodpack/shared build
RUN pnpm --filter @foodpack/web build

FROM node:22-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/shared packages/shared
COPY --from=build /app/apps/web apps/web

WORKDIR /app/apps/web
EXPOSE 3000

CMD ["pnpm", "start"]
