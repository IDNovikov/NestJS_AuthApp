Описание проекта:

Back:
NestJS, Prisma, Redis, ApolloServer, GraphQL, Swagger, rate-limit

1. Устанавливаем Prisma в качестве зависимости для разработки
   ОБЯЗАТЕЛЬНО ВКЛЮЧИТЬ ВПН
   npm i -D prisma
   npx prisma init
   Инициализируем Prisma-проект:
   npx prisma validate
   npx prisma migrate dev --name init //- название миграции
   =>npx prisma generate

   ?Если проблемы с generate:
   npm cache clean --force
   npm i @prisma/client@6.17.0
   =>npx prisma generate

1. В main.ts подключили swagger
1. в modules/core/ports реализовали порты NotificationsPort, QueuePort, EventBus (заменим на BullMQ/Telegram/ClickHouse без переписывания логики) в modules/core/adapters описали notifications.console.ts, queue.memory.ts, event-bus.noop.ts

- запуск redis:
  docker ps -a
  docker run -d --name redis -p 6379:6379 redis:7-alpine
  docker start redis
  docker stop redis
  docker rm redis

Измененив призму => миграция + ген:
npx prisma migrate dev --name add_auth_fields
npx prisma generate
