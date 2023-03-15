FROM node:16-alpine3.16 as development

ENV PATH /app/node_modules/.bin:$PATH
ENV PORT=3000
ENV NODE_ENV development

WORKDIR /frontend-react-js

COPY package.json .
COPY package-lock.json .

COPY . /frontend-react-js

RUN npm install

EXPOSE ${PORT}
CMD ["npm", "start"]