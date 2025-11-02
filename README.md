Описание проекта:

Стек:
Front:
Next, GraphQL, ApolloClient, TelegramOAuth, i18n, Redux Toolkit, Zod-Rezolver, TanstackQuery, SEO, Tailwind, Node-Telegram, emailer, React-hook-form, chadcn, AdminHS
Back:
NestJS, Prisma, Redis, ClickHouse, ApolloServer, GraphQL, BullMQ, Swagger, rate-limit + antiBot (captcha), S3,
Для чата и риал тайм уведомлений - отдельный микросервис: socketIO, gRPC, dockerCompose
CI/CD: ?

Логика:

1. Сборщики получают данные по типам (сразу афишу на одно событие):

   interface Slot {
   startsAt: string //DateTime
   slotItems: SlotItem[];
   }

   interface SlotItem {
   quantity: number;
   ticketType?: string;
   price: number;
   }

2. Записывают актуальную афишу в БД
3. Сравнивают старую афишу и новую
   3.1. Если появляются новые билеты, то уведомляют о них по подписке
   3.2. Если в подписке есть фильтры, то сопоставляет данные с фильтрами и отправляет толлько валидные данные
4. Если сборщики передают пустые данные Slot, но дата события не истекла то ставится статус SOLDOUT
5. Если дата события истекла, то данные Slot удаляются и status = ARCHIVE (отдельные ворекры по времени)

Архитектура:
src/
├── modules/
│ ├── event/ # CRUD + обновления афиши
│ ├── performance/ # даты и слоты
│ ├── ticket/ # Ticket/SlotItem CRUD
│ ├── subscription/ # подписки и фильтры
│ ├── user/ # Telegram + email
│ ├── notify/ # уведомления (BullMQ + mail + bot)
│ ├── parser/ # сервисы сбора данных
│ ├── chat/ # SocketIO/gRPC микросервис
│ ├── s3/ # загрузки и хранение файлов
│ └── core/ # Prisma, Redis, logger, config

Журнал реализации:

1. Глобально устанавливаем NestJS CLI и создаем NestJS-проект:
   npm i -g @nestjs/cli
1. 1. Улучшили конфиги проекта
1. 2. Доп зависмости:

   npm i @nestjs/swagger swagger-ui-express
   npm i @nestjs/graphql @nestjs/apollo graphql
   npm i -D jest @types/jest ts-jest jest-environment-node
   npm i -D nodemon
   npm i reflect-metadata
   npm i @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt @types/passport-jwt
   npm i ioredis @nestjs/throttler
   npm i pino-http pino
   npm i class-validator class-transformer
   npm i joi
   npm install @as-integrations/express
   npm install cookie-parser

1. Устанавливаем Prisma в качестве зависимости для разработки
   ОБЯЗАТЕЛЬНО ВКЛЮЧИТЬ ВПН
   npm i -D prisma
   npx prisma init
   Инициализируем Prisma-проект:
   npx prisma migrate dev --name init //- название миграции

1. Создаем призма схему
   Проверка:
   npx prisma validate
   Запуск первой миграции и создвние таблиц:
   npx prisma migrate dev --name init
   ?Если проблемы с generate:
   npm cache clean --force
   npm i @prisma/client@6.17.0
   npx prisma generate

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
