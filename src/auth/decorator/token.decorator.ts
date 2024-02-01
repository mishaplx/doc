import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { AUTH, JwtPayloadWithRefreshToken } from "../auth.const";

export const Token = createParamDecorator(
  (data: keyof JwtPayloadWithRefreshToken | undefined, context: ExecutionContext): IToken => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const token_access = req?.get("Authorization")?.replace("Bearer", "").trim();
    if (!token_access) {
      throw new BadRequestException(AUTH.ERR.TOKEN.NONE);
    }
    try {
      return new JwtService().decode(token_access)["payload"];
    } catch (err) {
      throw new BadRequestException(AUTH.ERR.TOKEN.INVALID);
    }
  },
);
