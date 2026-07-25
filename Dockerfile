FROM node:24-slim AS runtime-dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

CMD ["npm", "run", "dev"]

FROM node:24-slim AS runtime-prod

WORKDIR /app

COPY . /app

RUN npm ci

ENV NODE_ENV=production

# We don't run "npm run build" during the docker build because env_file vars are
# only available at runtime. dev dependencies are needed for the build (tsx for
# the prebuild step, next for the build itself), so we install them, build, then
# prune them before starting so the running container ships only prod dependencies.
CMD ["sh", "-c", "npm run build && npm prune --omit=dev && npm run start"]