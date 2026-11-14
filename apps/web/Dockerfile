FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --filter @aegis/web...

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN pnpm --filter @aegis/shared build
RUN pnpm --filter @aegis/web prisma generate

EXPOSE 3000

CMD ["pnpm", "--filter", "@aegis/web", "dev"]
