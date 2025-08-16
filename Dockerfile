FROM node:22-slim AS runtime-dev

WORKDIR /app

CMD ["npm", "run", "dev"]

FROM node:22-slim AS runtime-prod

WORKDIR /app

COPY . /app

RUN npm ci

# TODO: we could remove dev dependencies,
# or use a second container that just imports the built files

ENV NODE_ENV=production

# We don't do the "npm run build" during the docker build because env_file vars are only available at runtime
CMD ["sh", "-c", "npm run build && npm run start"]