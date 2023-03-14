FROM node:14-buster
WORKDIR /app
COPY package*.json ./
RUN npm install
# RUN npm install -g nodemon
COPY app.js . 
EXPOSE 8080
CMD [ "node", "app.js"]