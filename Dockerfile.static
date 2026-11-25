# syntax=docker/dockerfile:1

# using alpine base image to avoid `sharp` memory leaks.
# @see https://sharp.pixelplumbing.com/install#linux-memory-allocator

# build
FROM node:26-alpine AS build

RUN npm install --global pnpm@12.23.0

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

ENV CI=true
# Use the Node installation supplied by the base image.
ENV PNPM_CONFIG_RUNTIME=false
RUN pnpm fetch
# Install dependencies before copying sources to reuse this layer.
RUN pnpm install --frozen-lockfile --offline --ignore-scripts

COPY --chown=node:node --exclude=Caddyfile ./ ./

# Run deferred dependency scripts and project preparation with sources available.
RUN pnpm rebuild --pending

ARG PUBLIC_APP_BASE_PATH
ARG PUBLIC_APP_BASE_URL
ARG PUBLIC_BOTS
ARG PUBLIC_GOOGLE_SITE_VERIFICATION
ARG PUBLIC_MATOMO_BASE_URL
ARG PUBLIC_MATOMO_ID
ARG PUBLIC_REDMINE_ID

# disable validation for runtime environment variables
ENV ENV_VALIDATION=public

ENV NODE_ENV=production

RUN pnpm run build \
    && mkdir -p node_modules/.astro/assets node_modules/.astro/fonts

# Export optimized assets without adding the cache to the runtime image.
FROM scratch AS astro-cache
COPY --from=build /app/node_modules/.astro/assets /assets
COPY --from=build /app/node_modules/.astro/fonts /fonts

# serve
FROM caddy:2-alpine AS serve

RUN addgroup -S -g 10001 caddy && adduser -S -D -H -u 10001 -G caddy caddy \
    && chown -R caddy:caddy /config /data

WORKDIR /usr/share/caddy

ARG PUBLIC_APP_BASE_PATH
ENV APP_BASE_PATH=${PUBLIC_APP_BASE_PATH}

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy

USER 10001:10001
RUN caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

EXPOSE 3000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
