import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import "dotenv/config";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import Logger from "src/modules/logger/logger";
import { httpExceptErr } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import {
  deleteFileBlockIdUtil,
  deleteFileItemUtil,
  deleteFileVersionUtil,
} from "./fileDelete.utils";

@Injectable()
export class FileDeleteService {
  private readonly dataSource: DataSource;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource, private logger: Logger) {
    this.dataSource = dataSource;
  }

  /********************************************
   * ФАЙЛЫ: УДАЛИТЬ ФАЙЛОВЫЙ БЛОК
   ********************************************/
  deleteFileBlock = async (args: {
    token: IToken;
    idFileBlock: number;
    req: any;
  }): Promise<boolean | HttpException> => {
    try {
      return this.dataSource.transaction(async (manager) => {
        await this.logger.logFileOperation(
          args.token,
          args.req,
          this.dataSource.manager,
          "deleteBlock",
          undefined,
          args.idFileBlock,
        );
        return await deleteFileBlockIdUtil({
          manager: manager,
          idFileBlock: args.idFileBlock,
          user_session_id: args.token.session_id,
        });
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  };

  /********************************************
   * ФАЙЛЫ: УДАЛИТЬ ВЕРСИЮ ФАЙЛА
   * ЕСЛИ ВЕРСИЯ ЕДИНСТВЕННАЯ - УДАЛИТЬ БЛОК ЦЕЛИКОМ
   ********************************************/
  deleteFileVersion = async (
    idFileVersion: number,
    token: IToken,
    req: any,
  ): Promise<boolean | HttpException> => {
    try {
      return this.dataSource.transaction(async (manager) => {
        await this.logger.logFileOperation(
          token,
          req,
          this.dataSource.manager,
          "delete",
          undefined,
          undefined,
          idFileVersion,
        );
        return await deleteFileVersionUtil({
          manager: manager,
          idFileVersion: idFileVersion,
        });
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  };

  /********************************************
   * ФАЙЛЫ: УДАЛИТЬ ЗАВИСИМЫЙ ФАЙЛ
   ********************************************/
  deleteFileVersionDepend = async (idFileVersion: number): Promise<boolean | HttpException> => {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await deleteFileItemUtil({
          manager: manager,
          idFileVersion: idFileVersion,
          main: false,
        });
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  };
}
