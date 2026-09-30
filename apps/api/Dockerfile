FROM node:22-bookworm AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN pnpm --filter @foodpack/shared build
RUN pnpm --filter @foodpack/api prisma:generate
RUN pnpm --filter @foodpack/api build

FROM node:22-bookworm AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/shared packages/shared
COPY --from=build /app/apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 4000

CMD ["pnpm", "start:prod"]
