FROM node:16-alpine3.16 as build

ENV PATH /app/node_modules/.bin:$PATH
ENV PORT=3000
ENV NODE_ENV development

WORKDIR /frontend-react-js
COPY package.json .
COPY package-lock.json .
COPY . /frontend-react-js
RUN npm install
 
# Expose the port on which the app will be running (3000 is the default that `serve` uses)
EXPOSE ${PORT}
# Start the app
CMD [ "npm", "run", "start" ]