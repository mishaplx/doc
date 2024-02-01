import { ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { IPaginatedResponseResult } from "src/common/interfaces/pagination.interface";
import { customError } from "src/common/type/errorHelper.type";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import {
  isUserLoginValid,
  regUserLoginSuccess,
  regUserLoginWrong,
} from "src/modules/user/utils/user.login.utils";
import { PaginationInput } from "src/pagination/paginationDTO";

import { UserEntity } from "../../entity/#organization/user/user.entity";
import { UserService } from "../../modules/user/user.service";
import { AUTH } from "../auth.const";
import { GetAuthArgs } from "../dto/get-auth.args";
import { LoginResponse } from "../dto/login-response";
import { LoginUserInputUp } from "../dto/login-user-Up.input";
import { loginUserInputIn } from "../dto/login-userIn.input";
import { OrderAuthInput } from "../dto/order-auth-request.dto";
import {
  countAuthSession,
  createAuthSession,
  delAuthSession,
  updateAuthSession,
} from "../session/auth.session.utils";
import { AuthTokenService } from "../token/auth.token.service";
import { parseTokenRefresh } from "../token/auth.token.utils";

@Injectable()
export class AuthUserService {
  constructor(
    private readonly usersService: UserService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  /**
   * ПОЛЬЗОВАТЕЛЬ: ЗАРЕГИСТРИРОВАТЬ
   */
  async userSignUp(args: {
    loginUserInputUp: LoginUserInputUp;
    context: ExecutionContext;
    access_token: IToken;
  }): Promise<HttpException | string> {
    // const dataSourceLocal = await getDataSourceAdmin(args.access_token.url);

    // const checkRole = this.checkRole(context);
    // if (checkRole) {
    return await this.usersService.createUserInMainDb(args.loginUserInputUp, args.access_token);
    // } else {
    //   return new HttpException(
    //     `${PREF_ERR} нет доступа к данной операции`,
    //     HttpStatus.FORBIDDEN,
    //   );
    // }
  }

  /**
   * ПОЛЬЗОВАТЕЛЬ: ЗАЛОГИНИТЬ
   */
  async userSignIn(args: loginUserInputIn, ip: string): Promise<LoginResponse> {
    try {
      // валидная запись абонента в глобальной БД
      const abonentsEntity = await this.usersService.getAbonetEntity({
        login: args.username.trim().toLowerCase(),
      });

      const organization = abonentsEntity.AdminOrg;

      // локальная база данных

      const dataSourceLocal = await getDataSourceAdmin(organization.name);

      // валидная запись пользователя в локальной БД
      const userEntity: UserEntity = await this.usersService.getUserEntity({
        abonentsEntity: abonentsEntity,
        manager: dataSourceLocal.manager,
        org: organization.name,
      });
      // исчерпаны ли попытки регистрации
      const isValid = await isUserLoginValid({
        managerLocal: dataSourceLocal.manager, // !!! ВНЕ ТРАНЗАКЦИИ
        user_id: userEntity.id,
      });

      // проверить пароль
      const isCheck = await bcrypt.compare(args.password, userEntity.password);
      // зарегистрировать попытку входа и бросить ошибку
      if (!isValid || !isCheck) {
        const errMsg = await regUserLoginWrong({
          managerLocal: dataSourceLocal.manager, // !!! ВНЕ ТРАНЗАКЦИИ
          user_id: userEntity.id,
        });
        customError(errMsg);
      }

      // транзакция
      const ret = await dataSourceLocal.transaction(async (managerLocal) => {
        // сессия: создать
        const userSessionEntity = await createAuthSession({
          managerLocal: managerLocal,
          user_id: userEntity.id,
        });

        // токены: создать
        const tokens = await this.authTokenService.tokenCreate({
          abonentsEntity: abonentsEntity,
          userEntity: userEntity,
          session_id: userSessionEntity.id,
          ip: ip,
        });

        // сессия: обновить
        await updateAuthSession({
          managerLocal: managerLocal,
          session_id: userSessionEntity.id,
          date_expiration: tokens.refresh_token_expiration,
          refresh_token: tokens.refresh_token,
        });

        // дата последнего входа
        const { date_auth_success: retDateAuthSuccess } = await managerLocal.findOneByOrFail(
          UserEntity,
          { id: userEntity.id },
        );

        // зарегистрировать вход
        await regUserLoginSuccess({
          managerLocal: managerLocal,
          user_id: userEntity.id,
        });

        // количество активных сессий
        const retSessionCount = await countAuthSession({
          managerLocal: managerLocal,
          user_id: userEntity.id,
        });

        return {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          last_login: retDateAuthSuccess,
          count_session: retSessionCount,
        };
      });

      const viewing_access = await this.usersService.userAccessList(
        userEntity.current_emp_id,
        organization.name,
      );

      return {
        ...ret,
        ...viewing_access,
      };
    } catch (err) {
      customError(AUTH.ERR.SESSION.LOGIN, err);
    }
  }

  /**
   * ПОЛЬЗОВАТЕЛЬ: ОБНОВИТЬ ТОКЕН
   */
  async userSignRefresh(args: {
    refresh_token: string;
    context: ExecutionContext;
  }): Promise<LoginResponse> {
    try {
      // распарсить токены
      const rt_parsed_old = parseTokenRefresh(args.refresh_token);
      const at_parsed_old = rt_parsed_old.payload as IToken;

      // валидная запись абонента в глобальной БД
      const abonentsEntity = await this.usersService.getAbonetEntity({
        login: at_parsed_old.username,
      });
      const organization = abonentsEntity.AdminOrg;

      const dataSourceLocal = await getDataSourceAdmin(organization.name);

      // валидная запись пользователя в локальной БД
      const userEntity = await this.usersService.getUserEntity({
        abonentsEntity: abonentsEntity,
        manager: dataSourceLocal.manager,
        org: organization.name,
      });

      // токены: обновить
      const tokens = await this.authTokenService.tokenRefresh({
        abonentsEntity: abonentsEntity,
        userEntity: userEntity,
        refresh_token: rt_parsed_old,
        context: args.context,
      });

      const viewing_access = await this.usersService.userAccessList(
        userEntity.current_emp_id,
        organization.name,
      );

      return {
        ...tokens,
        ...viewing_access,
        refresh_token: args.refresh_token, // новый токен не отдавать
      };
    } catch (err) {
      customError(AUTH.ERR.SESSION.LOGIN, err);
    }
  }

  /**
   * ПОЛЬЗОВАТЕЛЬ: РАЗЛОГИНИТЬ
   */
  async userSignOut(token: IToken): Promise<boolean> {
    try {
      const dataSourceLocal = await getDataSourceAdmin(token.url);
      // удалить сессию
      await delAuthSession({
        managerLocal: dataSourceLocal.manager,
        session_id: token.session_id,
      });
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  /**
   * ПОЛЬЗОВАТЕЛЬ: УДАЛИТЬ
   */
  async userDelete(id: number, context: ExecutionContext): Promise<boolean | HttpException> {
    return await this.usersService.deleteUser(id, context);
  }

  /**
   * ПОЛЬЗОВАТЕЛИ: СПИСОК
   */
  async userList(
    token: IToken,
    args: GetAuthArgs,
    pagination: PaginationInput,
    orderBy: OrderAuthInput,
    searchField: string,
  ): Promise<IPaginatedResponseResult<UserEntity> | HttpException> {
    return await this.usersService.getListUsers(token, args, pagination, orderBy, searchField);
  }
}
