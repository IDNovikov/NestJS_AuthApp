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
   \*Если не видит .env
   npx prisma migrate dev --config=./prisma/prisma.config.ts --name init

2. запуск redis:
   docker ps -a
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   docker start redis
   docker stop redis
   docker rm redis

--TODO

1. ПРоблема: можно спамить новыми верификационными паролями
