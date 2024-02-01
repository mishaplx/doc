import "dotenv/config";

import { BadRequestException, Module, Scope } from "@nestjs/common";
import { CONTEXT } from "@nestjs/graphql";
import { parseTokenAccessHeader, parseTokenAccessRequest } from "src/auth/token/auth.token.utils";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError } from "src/common/type/errorHelper.type";
import { DataSource } from "typeorm";

import { DATA_SOURCE } from "./tenancy.symbols";
import { getDataSourceCorrect } from "./tenancy.utils";

const dataSourceFactory = {
  provide: DATA_SOURCE,
  scope: Scope.REQUEST,
  useFactory: async (context): Promise<DataSource> => {
    try {
      // распарсить токен
      let token: IToken;
      if (context.req) {
        token = parseTokenAccessRequest(context.req);
      } else if (context.headers) {
        token = parseTokenAccessHeader(context.headers);
      }
      if (!token) customError("Ошибка ключа авторизации");

      // получить соединение
      return await getDataSourceCorrect({
        org: token.url,
        emp_id: token.current_emp_id,
      });
    } catch (err) {
      throw new BadRequestException("Ошибка подключения к базе данных");
    }
  },
  inject: [CONTEXT],
};

@Module({
  providers: [dataSourceFactory],
  exports: [DATA_SOURCE],
})
export class TenancyModule {}
