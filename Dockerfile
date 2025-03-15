FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm","run","build"]
