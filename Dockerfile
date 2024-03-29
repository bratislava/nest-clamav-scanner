FROM node:20.9 AS base
FROM node:20.9-alpine AS base-alpine

# build
FROM base AS build

RUN apt-get update && apt-get install git

WORKDIR /root/app
COPY package*.json ./

RUN npm ci

COPY . ./

RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npx prisma migrate

RUN npm run build

# development
FROM base AS dev

RUN apt-get update && apt-get install -y git \
    postgresql-client \
    curl \
    vim

WORKDIR /home/node/app
COPY package*.json ./

RUN npm install
COPY . ./

RUN npx prisma generate

CMD [ "npm", "run", "start:debug" ]


# production
FROM base-alpine AS prod

USER node

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node --from=build /root/app/package*.json ./
COPY --chown=node:node --from=build /root/app/node_modules ./node_modules
RUN npm prune --production

COPY --chown=node:node --from=build /root/app/dist ./dist
COPY --chown=node:node --from=build /root/app/prisma ./prisma
COPY --chown=node:node nest-cli.json ./nest-cli.json

ENTRYPOINT npx prisma migrate deploy && npm run start:prod