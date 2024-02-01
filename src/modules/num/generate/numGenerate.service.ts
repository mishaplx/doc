import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { runNumGenerateUtil } from "./numGenerate.util";
import { httpExceptErr } from "src/common/type/errorHelper.type";

@Injectable()
export class NumGenerateService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
  }

  /**
   * НУМЕРАТОР: ГЕНЕРИРОВАТЬ НОМЕР
   */
  async runNumGenerate(args: {
    emp_id: number;
    doc_id: number;
    reserved_counter?: number;
    prepare?: boolean;
  }): Promise<string | HttpException> {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await runNumGenerateUtil({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  };
}
