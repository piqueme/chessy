# NOTE: This Dockerfile needs to be built from the project root
# to make use of Yarn zero installs. It is only located in the package
# directory since most of the build process is specific to the package
# itself.

FROM node:16-alpine as builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY . .
RUN yarn install --immutable --immutable-cache
RUN yarn workspace @puzlr/web build

FROM nginx:stable-alpine
COPY --from=builder /app/packages/web/build /var/www
COPY --from=builder /app/packages/web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
