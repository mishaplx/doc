import { ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

import { APIErrorCodeEnum } from "src/BACK_SYNC_FRONT/enum/enum.api";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { AUTH } from "../auth.const";
import { validAuthSession } from "../session/auth.session.utils";
import { cutTokenAccessRequest, verifyTokenAccess } from "../token/auth.token.utils";
import { getSettingsValBool } from "src/modules/settings/settings.util";
import { SETTING_CONST } from "src/modules/settings/settings.const";

@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    // в публичных методах проверки нет
    const isPublic = !!this.reflector.getAllAndOverride("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // прочитать токен
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const token = cutTokenAccessRequest(req); //req?.get("Authorization")?.replace("Bearer", "").trim();
    const payload: IToken = await verifyTokenAccess(token);

    // подключиться к БД как админ
    const dataSource = await getDataSourceAdmin(payload.url);

    // проверить токен на IP
    if (payload.ip != req?.ip &&
      getSettingsValBool({
        org: payload.url,
        key: SETTING_CONST.JWT_CONTROL_IP.nm,
    })) {
      throw new HttpException(AUTH.ERR.SESSION.IP, APIErrorCodeEnum.auth_ip);
    }

    // декоратор: не изменять дату последней активности
    const indifferentActivity = !!this.reflector.getAllAndOverride("indifferentActivity", [
      context.getHandler(),
      context.getClass(),
    ]);

    // проверить токен на актуальность
    if (
      !(await validAuthSession({
        managerLocal: dataSource.manager,
        access_token: payload,
        refresh_date_activity: !indifferentActivity,
      }))
    ) {
      throw new HttpException(AUTH.ERR.SESSION.TIMEOUT+'[2]', APIErrorCodeEnum.auth_timeout);
    }

    return super.canActivate(context);
  }
}
