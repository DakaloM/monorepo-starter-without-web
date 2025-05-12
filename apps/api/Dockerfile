FROM node:18.17.1-alpine AS base
RUN apk add --no-cache git
WORKDIR /app
ENV YARN_CACHE_FOLDER=.yarn-cache

FROM base AS pruner
RUN yarn global add turbo@1.10.13
COPY . .
RUN turbo prune --scope=api --docker

FROM base AS dev-deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

FROM base AS prod-deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
COPY --from=dev-deps /app/${YARN_CACHE_FOLDER} /${YARN_CACHE_FOLDER}
RUN yarn install --frozen-lockfile --production --prefer-offline
RUN rm -rf /app/${YARN_CACHE_FOLDER}

FROM base AS builder
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=dev-deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --filter=api
RUN find . -name node_modules | xargs rm -rf

# Stage: Final image
FROM node:18.17.1-alpine
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} \
  LANG=en_US.UTF-8 \
  HOME=/app \
  TERM=xterm

RUN apk add --no-cache tini
WORKDIR ${HOME}

COPY --from=prod-deps /app/ .
COPY --from=builder /app/ .

USER node
EXPOSE 3100
ENTRYPOINT ["/sbin/tini", "-s", "--"]
CMD ["node", "./apps/api/dist/src/index.js"]

