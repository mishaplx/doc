import { Injectable, Inject } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError } from "src/common/type/errorHelper.type";
import { getDataSourceAdmin, getDataSourceCorrect } from "src/database/datasource/tenancy/tenancy.utils";
import { UserSessionEntity } from "src/entity/#organization/user/userSession.entity";
import { getSettingsValInt } from "src/modules/settings/settings.util";

import { UserEntity } from "../../entity/#organization/user/user.entity";
import { UserService } from "../../modules/user/user.service";
import { AUTH } from "../auth.const";
import { createAuthSession,updateAuthSession } from "../session/auth.session.utils";
import { AuthTokenService } from "../token/auth.token.service";
import { UserSessionTypeEnum } from "../session/auth.session.const";
import { SETTING_CONST } from "src/modules/settings/settings.const";
import { PubSubService } from "src/pubsub/pubsub.service";
import { PsBaseCodeEnum } from "src/BACK_SYNC_FRONT/enum/enum.pubsub";

@Injectable()
export class AuthApiService {
  constructor(
    @Inject(PubSubService) private readonly pubSubService: PubSubService,
    private readonly usersService: UserService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  /**
   * ВНЕШНИЙ API: СОЗДАТЬ ТОКЕН И СЕССИЮ
   * @param(args.token) - токен обратившегося пользователя
   * @param(args.expires) - время api-доступа, мин. если не задано - по умолчанию
   * @param(args.note) - примечание
   * @return - access_token
   */
  async authApiCreate(args: {
    token: IToken;
    type_session: UserSessionTypeEnum.api_common | UserSessionTypeEnum.api_file_edit;
    expires?: number;
    note?: string;
  }): Promise<{
    token: string;
    session: UserSessionEntity;
  }> {
    const { token, type_session, expires, note } = args;
    try {
      // валидная запись абонента в глобальной БД
      const abonentsEntity = await this.usersService.getAbonetEntity({
        login: token.username,
      });

      // локальная база данных
      const dataSourceLocal = await getDataSourceAdmin(token.url);

      // валидная запись пользователя в локальной БД
      const userEntity: UserEntity = await this.usersService.getUserEntity({
        abonentsEntity: abonentsEntity,
        manager: dataSourceLocal.manager,
        org: token.url,
      });

      // время жизни токена и сессии, сек.
      let exp: number = expires;
      if (!exp) {
        switch(type_session) {
          case UserSessionTypeEnum.api_file_edit:
            exp = getSettingsValInt({
              org: token.url,
              key: SETTING_CONST.FILE_EDIT_EXCLUSIVE.nm,
            });
            break;
          case UserSessionTypeEnum.api_common:
            exp = 60 * 24; // 1 сутки
        }
      }
      exp *= 60;  // мин. -> сек.
      if (!exp) {
        customError('Недопустимое время жизни токена');
      }
      exp = Math.round(exp);

      // транзакция
      return await dataSourceLocal.transaction(async (managerLocal) => {
        // сессия: создать специальную
        const userSessionEntity = await createAuthSession({
          managerLocal: managerLocal,
          user_id: token.user_id,
          type_session: type_session,
        });

        // токены: создать
        const tokens = await this.authTokenService.tokenCreate({
          abonentsEntity: abonentsEntity,
          userEntity: userEntity,
          session_id: userSessionEntity.id,
          ip: token.ip,
          expires_token_access: exp,
          expires_token_refresh: exp,
        });

        // сессия: обновить
        await updateAuthSession({
          managerLocal: managerLocal,
          session_id: userSessionEntity.id,
          date_expiration: tokens.refresh_token_expiration,
          refresh_token: tokens.refresh_token,
          note: note,
        });

        return {
          token: tokens.access_token,
          session: await managerLocal.findOneByOrFail(UserSessionEntity, { id: userSessionEntity.id }),
        };
      });
    } catch (err) {
      customError(AUTH.ERR.SESSION.CREATE, err);
    }
  }


  /**
   * ВНЕШНИЙ API: ОБНОВИТЬ СЕССИЮ
   * @param(args.token) - токен обратившегося пользователя
   * @param(args.session_id) - id сессии
   * @param(args.note) - примечание
   */
  async authApiUpdate(args: {
    token: IToken;
    session_id: number;
    note: string;
  }): Promise<UserSessionEntity> {
    const { token, session_id, note } = args;
    try {
      // локальная база данных
      const dataSourceLocal = await getDataSourceCorrect({
        org: token.url,
        emp_id: token.current_emp_id,
      });

      await dataSourceLocal.manager.update(
        UserSessionEntity,
        { id: session_id },
        { note: note },
      );

      return await dataSourceLocal.manager.findOneBy(
        UserSessionEntity,
        { id: session_id },
      );
    } catch (err) {
      customError(AUTH.ERR.SESSION.UPDATE, err);
    }
  }


  /**
   * ВНЕШНИЙ API: УДАЛИТЬ СЕССИЮ
   * @param(args.token) - токен обратившегося пользователя
   * @param(args.session_id) - id сессии
   */
  async authApiDelete(args: {
    token: IToken;
    session_id: number;
  }): Promise<boolean> {
    const { token, session_id } = args;
    try {
      // локальная база данных
      const dataSourceLocal = await getDataSourceCorrect({
        org: token.url,
        emp_id: token.current_emp_id,
      });

      // найти запись
      const userSessionEntity = await dataSourceLocal.manager.findOneBy(UserSessionEntity, {
        id: session_id,
      });
      if (!userSessionEntity) { customError(AUTH.ERR.SESSION.NONE); }

      // команда на фронт на завершение сессии
      await this.pubSubService.pubSys({
        org: token.url,
        session_id: session_id,
        msg: AUTH.ERR.SESSION.CLOSE,
        code: [PsBaseCodeEnum.session_terminated],
      });

      // удалить запись
      await dataSourceLocal.manager.delete(
        UserSessionEntity,
        { id: session_id },
      );

      return true;
    } catch (err) {
      customError(AUTH.ERR.SESSION.DELETE, err);
    }
  }

}

  // /**
  //  * ПОЛЬЗОВАТЕЛЬ: ОБНОВИТЬ ТОКЕН
  //  */
  // async userSignRefresh(args: {
  //   refresh_token: string;
  //   context: ExecutionContext;
  // }): Promise<LoginResponse> {
  //   try {
  //     // распарсить токены
  //     const rt_parsed_old = parseTokenRefresh(args.refresh_token);
  //     const at_parsed_old = rt_parsed_old.payload as IToken;

  //     // валидная запись абонента в глобальной БД
  //     const abonentsEntity = await this.usersService.getAbonetEntity({
  //       login: at_parsed_old.username,
  //     });
  //     const organization = abonentsEntity.AdminOrg;

  //     const dataSourceLocal = await getDataSourceAdmin(organization.name);

  //     // валидная запись пользователя в локальной БД
  //     const userEntity = await this.usersService.getUserEntity({
  //       abonentsEntity: abonentsEntity,
  //       manager: dataSourceLocal.manager,
  //     });

  //     // токены: обновить
  //     const tokens = await this.authTokenService.tokenRefresh({
  //       abonentsEntity: abonentsEntity,
  //       userEntity: userEntity,
  //       refresh_token: rt_parsed_old,
  //       context: args.context,
  //     });

  //     const viewing_access = await this.usersService.userAccessList(
  //       userEntity.current_emp_id,
  //       organization.name,
  //     );

  //     return {
  //       ...tokens,
  //       ...viewing_access,
  //       refresh_token: args.refresh_token, // новый токен не отдавать
  //     };
  //   } catch (err) {
  //     customError(AUTH.ERR.SESSION.LOGIN, err);
  //   }
  // }

  // /**
  //  * ПОЛЬЗОВАТЕЛЬ: РАЗЛОГИНИТЬ
  //  */
  // async userSignOut(token: IToken): Promise<boolean> {
  //   try {
  //     const dataSourceLocal = await getDataSourceAdmin(token.url);
  //     // удалить сессию
  //     await delAuthSession({
  //       managerLocal: dataSourceLocal.manager,
  //       session_id: token.session_id,
  //     });
  //     return true;
  //   } catch (err) {
  //     throw new UnauthorizedException();
  //   }
  // }

  // /**
  //  * ПОЛЬЗОВАТЕЛЬ: УДАЛИТЬ
  //  */
  // async userDelete(id: number, context: ExecutionContext): Promise<boolean | HttpException> {
  //   return await this.usersService.deleteUser(id, context);
  // }

  // /**
  //  * ПОЛЬЗОВАТЕЛИ: СПИСОК
  //  */
  // async userList(
  //   token: IToken,
  //   args: GetAuthArgs,
  //   pagination: PaginationInput,
  //   orderBy: OrderAuthInput,
  //   searchField: string,
  // ): Promise<IPaginatedResponseResult<UserEntity> | HttpException> {
  //   return await this.usersService.getListUsers(token, args, pagination, orderBy, searchField);
  // }
