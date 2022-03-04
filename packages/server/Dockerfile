FROM node:16-alpine as builder

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app
# We attempt to install for the whole repo since we have Yarn cache.
COPY . .
RUN yarn install --immutable --immutable-cache
RUN yarn workspaces foreach -tR --from @puzlr/server run clean
RUN yarn workspaces foreach -tR --from @puzlr/server run build

# Our actual built image
FROM node:16-alpine
WORKDIR /app
# Copy Yarn module maps, built files, and workspace dependency builds
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.pnp.cjs ./.pnp.cjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/server/build ./packages/server/build
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
# TODO: Ideally this gets packaged through plugin or NPM packaging
COPY --from=builder /app/packages/core/build ./packages/core/build
COPY --from=builder /app/packages/core/package.json ./packages/core/package.json
EXPOSE 8080
CMD ["yarn", "node", "./packages/server/build/server.js"]
