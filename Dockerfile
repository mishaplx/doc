FROM node:16 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY .. .

# Install app dependencies
RUN npm i



RUN npm run build
RUN rm /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Minsk /etc/localtime
FROM node:16

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ts*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.prod ./.env
COPY --from=builder /app/src ./src
#COPY --from=builder *.json ./src

EXPOSE 3000
#Настрока времени на сервере
CMD [ "npm", "run", "start:pre-prod" ]
