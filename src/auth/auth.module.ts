import "dotenv/config";

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UserModel } from "../modules/user/users.module";
import { AuthApiService } from "./api/auth.api.service";
import { AuthAccessService } from "./auth.access.service";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { AuthCronSessionService } from "./cron/auth.cron.session.service";
import { AuthSessionResolver } from "./session/auth.session.resolver";
import { AuthSessionService } from "./session/auth.session.service";
import { accessTokenStrategy } from "./strategy/acessToken.strategy";
import { RefreshTokenStrategy } from "./strategy/refreshToken.strategy";
import { AuthTokenService } from "./token/auth.token.service";
import { AuthUserService } from "./user/auth.user.service";

@Module({
  imports: [UserModel, PassportModule.register({}), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthCronSessionService,
    AuthResolver,
    AuthTokenService,
    AuthSessionResolver,
    AuthSessionService,
    AuthUserService,
    AuthApiService,
    AuthAccessService,
    accessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [AuthUserService, AuthApiService],
})
export class AuthModule {}
