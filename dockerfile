ARG NODE_VERSION=20.19.0

FROM node:${NODE_VERSION}-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build 
EXPOSE 5000
CMD [ "npm","run", "start:prod"]