FROM node:12-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn install --prod

CMD ["node", "./src/index.js"]
