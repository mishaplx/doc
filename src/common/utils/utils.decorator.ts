import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

/**
 * ОПРЕДЕЛИТЬ IP ПОЛЬЗОВАТЕЛЯ
 */
export const UserIp = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.ip;
});
