<<<<<<< HEAD
FROM node:14-buster
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . . 
EXPOSE 3002
CMD [ "npm", "start"]
=======
FROM node:16.18 AS base
COPY . /app

FROM base AS app
WORKDIR /app
RUN npm install

FROM app As Prod
CMD ["./entrypoint.sh", "NODE"]
>>>>>>> token-verifier-envoy
