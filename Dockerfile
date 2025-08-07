FROM node:22-slim AS runtime-dev

WORKDIR /app

CMD ["npm", "run", "dev"]