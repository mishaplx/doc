import { ExecutionContext, HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IToken, ITokenRefreshFull } from "src/BACK_SYNC_FRONT/auth";
import { APIErrorCodeEnum } from "src/BACK_SYNC_FRONT/enum/enum.api";
import { customError } from "src/common/type/errorHelper.type";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { Admin_abonentsEntity } from "src/entity/#adminBase/admin_abonents/admin_abonents.entity";

import { UserEntity } from "../../entity/#organization/user/user.entity";
import { UserService } from "../../modules/user/user.service";
import { AUTH } from "../auth.const";
import {
  getTimeoutAuthSession,
  updateAuthSession,
  validAuthSession,
} from "../session/auth.session.utils";
import { getExpTokenAccess, getExpTokenRefresh, parseTokenRefresh } from "./auth.token.utils";

@Injectable()
export class AuthTokenService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  /**
   * ТОКЕН: СОЗДАТЬ
   * @param(expires_token_access) - время жизни токена access, сек. - если не задано - по умолчанию
   * @param(expires_token_refresh) - то же для refresh
   */
  async tokenCreate(args: {
    abonentsEntity: Admin_abonentsEntity;
    userEntity: UserEntity;
    session_id: number;
    ip: string;
    expires_token_access?: number;
    expires_token_refresh?: number;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    refresh_token_expiration: Date;
  }> {
    const {
      abonentsEntity,
      userEntity,
      session_id,
      ip,
      expires_token_access,
      expires_token_refresh,
    } = args;
    try {
      const staff = await userEntity?.Staff;
      const organization = abonentsEntity.AdminOrg;
      const payload: IToken = {
        username: abonentsEntity.username,
        url: organization.name,
        ip: ip, // context?.req?.socket?.remoteAddress,
        session_id: session_id,
        session_timeout: getTimeoutAuthSession(organization.name),
        user_id: userEntity.id,
        staff_id: staff?.id,
        current_emp_id: userEntity.current_emp_id,
        fio: staff?.FIO,
      };

      const post = await this.userService.findCurrentPost(
        userEntity.current_emp_id,
        organization.name,
      );
      payload.post = post.nm;
      if (userEntity.isblocked) customError(AUTH.ERR.USER.BLOCK);

      const access_token = this.jwtService.sign(
        {
          payload,
        },
        {
          secret: process.env.JWT_SECRET_ACCESS,
          expiresIn: expires_token_access ?? getExpTokenAccess(organization.name),
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          payload,
          access_token,
        },
        {
          secret: process.env.JWT_SECRET_REFRESH,
          expiresIn: expires_token_refresh ?? getExpTokenRefresh(organization.name),
        },
      );
      const { exp: refresh_token_expiration } = parseTokenRefresh(refresh_token);

      return {
        access_token: access_token,
        refresh_token: refresh_token,
        refresh_token_expiration: new Date(refresh_token_expiration * 1000),
      };
    } catch (err) {
      customError(AUTH.ERR.COMMON, err);
    }
  }

  /**
   * ТОКЕН: ОБНОВИТЬ
   */
  async tokenRefresh(args: {
    abonentsEntity: Admin_abonentsEntity;
    userEntity: UserEntity;
    refresh_token: ITokenRefreshFull;
    context: ExecutionContext;
  }): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const { refresh_token: rt_parsed_old } = args;
      const at_parsed_old = rt_parsed_old.payload as IToken;

      // валидная запись абонента в глобальной БД
      const abonentsEntity = await this.userService.getAbonetEntity({
        login: at_parsed_old.username,
      });

      const organization = abonentsEntity.AdminOrg;

      // валидная запись пользователя в локальной БД
      const dataSourceLocal = await getDataSourceAdmin(organization.name);
      const userEntity = await this.userService.getUserEntity({
        abonentsEntity: abonentsEntity,
        manager: dataSourceLocal.manager,
        org: organization.name,
      });

      // проверить актуальность сессии
      if (
        !(await validAuthSession({
          managerLocal: dataSourceLocal.manager,
          access_token: at_parsed_old,
          refresh_date_activity: false, // не обновлять время посследней активности
        }))
      ) {
        throw new HttpException(AUTH.ERR.SESSION.TIMEOUT+'[3]', APIErrorCodeEnum.auth_timeout);
      }

      // создать токены
      const { access_token: at_str_new, refresh_token: rt_str_new } = await this.tokenCreate({
        abonentsEntity: abonentsEntity,
        userEntity: userEntity,
        session_id: at_parsed_old.session_id,
        ip: at_parsed_old.ip,
      });

      // записать сведения о сессии
      await updateAuthSession({
        managerLocal: dataSourceLocal.manager,
        session_id: at_parsed_old.session_id,
      });

      return {
        access_token: at_str_new,
        refresh_token: rt_str_new,
      };
    } catch (err) {
      customError(AUTH.ERR.COMMON, err);
    }
  }
}
