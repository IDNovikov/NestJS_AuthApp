Регистрация ("registration")

1. @Post()
   async registrate(@Body() dto: RegistrateDto) {
   return this.facade.registrate(dto);
   }
   row json
   {
   "email":"billcozy@yandex.ru",
   "password":"234paS$word",
   "userName":"userNAme"
   }
   answer
   {
   "email": "billcozy@yandex.ru",
   "expiresTime": "2025-11-18T12:45:30.032Z",
   "message": "User created. Check your email for verification code."
   }

2. @Post('email/new-code')
   async getNewVerificationCode(@Body() dto: EmailDto) {
   return this.facade.getNewVerificationCode(dto.email);
   }
   row json
   {
   "email":"billcozy@yandex.ru"
   }
   answer
   {
   "email": "billcozy@yandex.ru",
   "expiresTime": "2025-11-18T12:59:49.521Z",
   "message": "Check your email for verification code."
   }

3. Верификация
   @UseInterceptors(CookieInterceptor)
   @Post('verify/email')
   async verify(
   @Body() dto: VerifyDto,
   @SessionData() sessionData: ISessionData,
   ) {
   return this.facade.verifyEmail(dto, sessionData);
   }
   row json
   {
   "email":"billcozy@yandex.ru",
   "confirmCode":"440913"
   }
   answer
   {
   "user": {
   "userId": 6,
   "email": "billcozy@yandex.ru",
   "role": "ADMIN"
   },
   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsImVtYWlsIjoiYmlsbGNvenlAeWFuZGV4LnJ1Iiwicm9sZSI6IkFETUlOIiwianRpIjoiMzQ1ZWFjMzctYTQ5Zi00ZWFjLTliNGYtODM5MTkyNzMzNmIxIiwiaWF0IjoxNzYzNDcwNjkyLCJleHAiOjE3NjM0NzE1OTJ9.hibsU1Tl8Qtg-hB6FmBkTTDmXRonpMnlv_26IYA-6gU"
   }

АВТОРИЗАЦИЯ (auth)

1. @UseInterceptors(CookieInterceptor)
   @Post('login')
   async login(
   @Body() dto: LoginDto,
   @SessionData() sessionData: ISessionData,
   @RefreshToken() token: string,
   ) {
   return this.facade.login(dto, token, sessionData);
   }
   row json
   {
   "email":"billcozy@yandex.ru",
   "password":"234paS$word"
   }
   answer
   {
   "message": "Login successful",
   "user": {
   "id": 7,
   "email": "billcozy@yandex.ru",
   "role": "ADMIN"
   },
   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsImVtYWlsIjoiYmlsbGNvenlAeWFuZGV4LnJ1Iiwicm9sZSI6IkFETUlOIiwianRpIjoiZTk3MmI3MTgtMDc4Ni00NjRkLWJiMDAtZGJjMjNhZTMwMWYxIiwiaWF0IjoxNzYzNDc1OTU1LCJleHAiOjE3NjM0NzY4NTV9.ixgTS6AMGfVWQ1F_hf_OX1RXvV2C4YO8NJTKw2wOEQE"
   }
2. @UseInterceptors(CookieInterceptor)
   @Get('refresh-tokens')
   @UseGuards(RefreshJwtAuthGuard)
   async refresh(
   @RefreshToken() token: string,
   @SessionData() sessionData: ISessionData,
   ) {
   return this.facade.refreshTokens(token, sessionData);
   }
   answer
   {
   "message": "Tokens refreshed",
   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsImVtYWlsIjoiYmlsbGNvenlAeWFuZGV4LnJ1Iiwicm9sZSI6IkFETUlOIiwianRpIjoiM2M2OTE4YzAtOTcxMS00YTk1LTkzOTctMzExMmQ2YzMzYTI4IiwiaWF0IjoxNzYzNDc2MjI3LCJleHAiOjE3NjM0NzcxMjd9.4hyAAoM1KycXqpohIi7A7jWyog983fS15IuARVXe-FE"
   }
3. @UseInterceptors(CookieInterceptor)
   @Delete('logout')
   @UseGuards(JwtAuthGuard)
   async logout(@RefreshToken() token: string, @User() user: { jti: string }) {
   return this.facade.logout(token, user.jti);
   }
   answer
   {
   "message": "User logged out"
   }

PASSWORD('password')

1. @Put('change')
   @UseGuards(JwtAuthGuard)
   async changePass(
   @Body() dto: ChangePassDto,
   @User() user: { sub: number; email: string; role: string },
   ) {
   return this.facade.changePassword(user.sub, dto);
   }
   row json
   {
   "oldPassword":"234paS$word",
    "newPassword":"234paS$word1"
   }
   answer
   {
   "message": "Password successfully changed."
   }
2. @Post('forgot')
   async getTempPass(@Body() dto: GetTempPassDto) {
   return this.facade.getTempPass(dto.email);
   }
   row json
   {
   "email":"billcozy@yandex.ru"
   }
   answer
   {
   "message": "Password successfully changed. Check your email"
   }

SESSION(sessions)

1.  @Get()
    @UseGuards(JwtAuthGuard)
    async getUserSessions(@RefreshToken() token: string) {
    return this.facade.getUserSessions(token);
    }
    answer
    {
    "data": [
    {
    "deviceId": "f16e96c8-c03f-4a05-a335-d3120ed7ea87",
    "session": {
    "userAgent": "PostmanRuntime/7.50.0",
    "device": "Desktop",
    "location": {
    "ip": "Unknown",
    "city": "",
    "country": ""
    }
    }
    },
    {
    "deviceId": "33d971f9-213d-4c3d-a2b2-aaae2eaee501",
    "session": {
    "userAgent": "PostmanRuntime/7.50.0",
    "device": "Desktop",
    "location": {
    "ip": "Unknown",
    "city": "",
    "country": ""
    }
    }
    }
    ]
    }

2.  Delete
    @Delete('sessions')
    @UseGuards(JwtAuthGuard)
    async logoutSession(
    @RefreshToken() token: string,
    @Query() params: DeleteSessionDTO,
    ) {
    return this.facade.logoutSession(token, params.deviceId);
    }
    answer
    {
    "message": "Session 375af541-ac19-437e-82e8-68432c2a3340 is closed"
    }

ADMIN("admin")

1. @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('ADMIN')
   @Get('sessions/all')
   async getAllSessionsByAdmin() {
   return this.facade.getAllSessionsByAdmin();
   }
   answer
   {
   "data": [
   {
   "userId": "6",
   "deviceId": "011b330c-8050-44c4-bf7f-cdb4955ad426",
   "session": {
   "userAgent": "PostmanRuntime/7.50.0",
   "device": "Desktop",
   "location": {
   "ip": "Unknown",
   "city": "",
   "country": ""
   }
   }
   },
   {
   "userId": "8",
   "deviceId": "5334c0fc-e460-4dc6-adad-0f218f9a267a",
   "session": {
   "userAgent": "PostmanRuntime/7.50.0",
   "device": "Desktop",
   "location": {
   "ip": "94.237.38.152",
   "city": "Helsinki",
   "country": "Finland"
   }
   }
   },
   {
   "userId": "7",
   "deviceId": "f16e96c8-c03f-4a05-a335-d3120ed7ea87",
   "session": {
   "userAgent": "PostmanRuntime/7.50.0",
   "device": "Desktop",
   "location": {
   "ip": "Unknown",
   "city": "",
   "country": ""
   }
   }
   }
   ]
   }
2. @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('ADMIN')
   @Delete('sessions/:userId')
   async logoutUsersSessionsByAdmin(
   @Param('userId', ParseIntPipe) userId: number,
   ) {
   return this.facade.logoutUserSessionsByAdmin(userId);
   }
   answer
   {
   "message": "Session of 8 is closed"
   }
3. @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('ADMIN')
   @Delete('sessions/all')
   async logoutAllSessionsByAdmin() {
   return this.facade.logoutAllSessionsByAdmin();
   }
   answer
   { message: `All sessions is closed` };

!!! РАБОТА С ТОКЕНАМИ !!!
ЮЗЕРУ
-(хедер) access_token: IAccessPayload {sub,email,role,jti};
-(куки) refresh_token: IRefreshPayload{sub,email,role,deviceId}

В РЕДИС
IRedisToken = {key: string value: RedisRefreshValue | null};

KEY
: user_id : deviceID
refreshToken:6:011b330c-8050-44c4-bf7f-cdb4955ad426

VALUE : RedisRefreshValue {hash,jti,sessionData,createdAt}
