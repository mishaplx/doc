import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtPayloadWithRefreshToken } from "../auth.const";

export const CheckUserDecorator = createParamDecorator(
  (data: keyof JwtPayloadWithRefreshToken | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);

    const req = ctx.getContext().req;
    if (data) return req.user;
    return req.user;
  },
);
