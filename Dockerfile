FROM node:15.0.1-alpine

WORKDIR /usr/src
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 8080
USER 1000:1000

#USER lavanda
CMD [ "node", "src/server.js" ]
