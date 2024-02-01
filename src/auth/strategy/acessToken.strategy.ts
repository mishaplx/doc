import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import "dotenv/config";
import { JwtPayload } from "../auth.const";

@Injectable()
export class accessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_ACCESS,
      passReqToCallback: true,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
