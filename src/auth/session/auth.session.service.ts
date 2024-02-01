import { HttpException, Inject, Injectable } from "@nestjs/common";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { IPaginatedResponseResult } from "../../common/interfaces/pagination.interface";
import { getDataSourceCorrect } from "../../database/datasource/tenancy/tenancy.utils";
import { UserSessionEntity } from "../../entity/#organization/user/userSession.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { customError, setErrorGQL } from "src/common/type/errorHelper.type";
import { OrderUserSessionInput } from "./auth.session.dto";
import { UserSessionTypeEnum } from "./auth.session.const";
import { AuthApiService } from "../api/auth.api.service";

const ERR = "Сессии: ошибка ";

@Injectable()
export class AuthSessionService {
  constructor(
    @Inject(AuthApiService) private readonly authApiService: AuthApiService,
  ) {}

  /**
   * LIST
   */
  async listAuthSession(
    token: IToken,
    pagination: PaginationInput,
    orderBy: OrderUserSessionInput,
    searchField: string,
  ): Promise<IPaginatedResponseResult<UserSessionEntity> | HttpException> {
    try {
      const dataSource = await getDataSourceCorrect({
        org: token.url,
        emp_id: token.current_emp_id,
      });
      const queryBuilder = dataSource.manager
        .createQueryBuilder(UserSessionEntity, "user_session")
        .where("user_session.date_expiration > :date_now", { date_now: new Date() });
        // .andWhere(`user_session.user_id = ${token.user_id}`); задача на RLS
      const { pageNumber, pageSize, All } = pagination;

      // TODO
      // if (searchField?.trim()) {
      //   globalSearchBuilderNum(queryBuilder, searchField);
      // } else {
      //   setQueryBuilderNum(args, orderBy, queryBuilder);
      // }

      if (!All && pageNumber && pageSize) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }

      const [recs, total] = await queryBuilder.getManyAndCount();
      return paginatedResponseResult(recs, pageNumber, pageSize, total);

    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * CREATE API SESSION
   */
  async createAuthApiSession(args: {
    token: IToken;
    date_end: Date;
    note?: string;
  }): Promise<UserSessionEntity> {
    try {
      // время api-доступа, мин.
      const expires = (args.date_end.getTime() - new Date().getTime()) / 1000 / 60;
      const { session: userSessionEntity } =
        await this.authApiService.authApiCreate({
          token: args.token,
          type_session: UserSessionTypeEnum.api_common,
          expires: expires,
          note: args.note,
        });
      return userSessionEntity;
    } catch (err) {
      customError(ERR + "создания записи", err);
    }
  }


  /**
   * UPDATE API SESSION
   */
  async updateAuthApiSession(args: {
    token: IToken,
    session_id: number;
    note: string;
  }): Promise<UserSessionEntity> {
    try {
      return await this.authApiService.authApiUpdate({
        token: args.token,
        session_id: args.session_id,
        note: args.note,
      });
    } catch (err) {
      customError(ERR + "обновления записи", err);
    }
  }


  /**
   * DELETE API SESSION
   */
  async deleteAuthApiSession(args: {
    token: IToken,
    session_id: number;
  }): Promise<boolean> {
    try {
      return await this.authApiService.authApiDelete({
        token: args.token,
        session_id: args.session_id,
      });
    } catch (err) {
      customError(ERR + "удаления записи", err);
    }
  }

}
