# Описание проекта:
Рабочий auth модуль, user, desks, stickers. Есть свагер дока. Модульная архитектура.

# Backend
Stack: NestJS, Prisma, Redis, ApolloServer, GraphQL, Swagger, rate-limit.

## Установка Prisma  
Обязательно включить VPN.  
npm i -D prisma  
npx prisma init  
npx prisma validate  
npx prisma migrate dev --name init  
npx prisma generate  

Если возникают проблемы с generate:  
npm cache clean --force  
npm i @prisma/client@6.17.0  
npx prisma generate  

Альтернативный запуск миграций:  
npx prisma migrate dev --config=./prisma/prisma.config.ts --name init

## Работа с Redis  
docker ps -a  
docker run -d --name redis -p 6379:6379 redis:7-alpine  
docker start redis  
docker stop redis  
docker rm redis
