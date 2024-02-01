import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import "dotenv/config";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload, JwtPayloadWithRefreshToken } from "../auth.const";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_REFRESH,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const refreshToken = req?.get("Authorization")?.replace("Bearer", "").trim();
    return { ...payload, refreshToken };
  }
}
