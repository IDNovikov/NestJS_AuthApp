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

....................................................

Продолжим работу с рефреш токенами.

1. Нужно ли создать отдельный сервис с рефреш токенами? Или это избыточно?
   model RefreshToken {
   id Int @id @default(autoincrement())
   tokenHash String
   userId Int
   deviceId String? // уникальный id устройства
   userAgent String? // браузер/платформа
   createdAt DateTime @default(now())
   expiresAt DateTime
   user User @relation(fields: [userId], references: [id])
   }
   Если такая модель, то я к ней буду напрямую обращать в auth service ?

2. Вопрос, при логировании. Допустим создали сессию юзера, но он решает повторно создать сессию (залогинится) это не создаст второй токен с новым deviceId, хотя устройство по факту будет тем же? Если да, то как ограничить действие юзера? Если есть валидные токены то нужно ограничить доступ к /login? Как сделать через middleware или какую-то дополнительную проверку токенов в роуте?

3. Допустим я сделал админ роут logout-all, который должен обнулить все сессии, но access токен же будет какое-то время валидным? Как сделать моментальное прекращение всех сессий?

4. Вопрос. У меня есть отдельная сущность RefreshToken, зачем мне тогда refresh токен дублировать в redis ?

5. Откуда брать deviceId? Из токена? Тогда как должна выглядеть последовательность? Откуда также брать IP?

@UseInterceptors(CookieInterceptor)
@Post('refresh-tokens')
@UseGuards(RefreshJwtAuthGuard)
@ApiOperation({ summary: 'Access and refresh tokens' })
@ApiResponse({ status: 200 })
async refresh(@RefreshToken() token: string) {
const tokens = await this.auth.refreshTokens(token);
return {
message: 'Tokens refreshed',
access_token: tokens.access_token,
refresh_token: tokens.refresh_token,
};
}
async refreshTokens(refreshToken: string) {
//make types
const { sub, email, jti} = await this.jwt.verify(refreshToken, {
secret: this.cfg.get('JWT_REFRESH_SECRET'),
});

    const user = await this.prisma.refreshToken.findUnique({where:{u}});

    if (!user.refreshToken) throw new ForbiddenException('Mismatch token');

    const match = await this.hash.compare(refreshToken, user.refreshToken);

    if (!match) throw new ForbiddenException('Invalid refresh token');

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const hashedRefreshToken = await this.hash.hash(tokens.refresh_token);
    await this.user.updateUser(user.id, { refreshToken: hashedRefreshToken });
    return tokens;

}
private async generateTokens({
userId,
email,
role,
}: JWTpayload): Promise<{ access_token: string; refresh_token: string }> {
const deviceId = randomUUID();

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role },
        {
          secret: this.cfg.get('JWT_SECRET'),
          expiresIn: this.cfg.get('JWT_EXPIRES'),
        },
      ),
      this.jwt.signAsync(
        { sub: userId, email, role, jti: deviceId },
        {
          secret: this.cfg.get('JWT_REFRESH_SECRET'),
          expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES'),
        },
      ),
    ]);

6. Вопрос. Методы админа лучше вынести в отдельный модуль?
   //Может либо админ, либо сам юзер
   //@Post('logoutUser')
   // async logoutAll(){
   // async this.auth.logoutUser()
   //Просто удаляем все рефреш токены юзера
   // }

7. Как написать крон задачу для удаления пользователей, которые не прошли верификацию по почте? А также expiresAt и фоновую задачу (BullMQ/cron) для очистки старых токенов

8. ПОПРОБУЮ САМ!!!!!! Redis - Rate limiting / защита
   ограничивает количество refresh-запросов и попыток логина, а также verify-email. Как создать?

9. УДАЛЕНИЕ НЕВЕРИФИЦИРОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ ПО КРОНУ!!!!
