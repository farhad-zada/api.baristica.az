FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

COPY . . 

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -s 1001

RUN chown nodejs:nodejs -R /usr/src/app

USER nodejs

CMD ["node", "telegram/index.js"]