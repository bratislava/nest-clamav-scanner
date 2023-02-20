# build
FROM node:16.10.0 AS build

WORKDIR /root/app
COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run build

# development
FROM node:16.10.0 AS dev

RUN apt-get update && apt-get install -y git \
    curl \
    vim

WORKDIR /home/node/app
COPY package*.json ./

RUN npm install
COPY . ./

CMD [ "npm", "run", "start:debug" ]


# production
FROM node:16.10.0-alpine AS prod

USER node

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node --from=build /root/app/package*.json ./
COPY --chown=node:node --from=build /root/app/node_modules ./node_modules
RUN npm prune --production

COPY --chown=node:node --from=build /root/app/dist ./dist
COPY --chown=node:node nest-cli.json ./nest-cli.json

ENTRYPOINT npm run start:prod


