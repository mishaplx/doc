import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { setErrorGQL } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { SignEntity } from "../../../entity/#organization/sign/sign.entity";
import { signAddUtil } from "../utils/sign.utils";

const ERR = "ЭЦП: ошибка ";

@Injectable()
export class SignCrudService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  /********************************************
   * ДОБАВИТЬ ПОДПИСЬ
   * @param args
   ********************************************/
  async signAdd(args: {
    sign: string;
    emp_id?: number;
    file_item_id?: number;
    project_id?: number;
    doc_id?: number;
    job_id?: number;
    inventory_id?: number;
    date_create?: Date;
  }): Promise<SignEntity | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        return await signAddUtil({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return setErrorGQL(ERR + "добавления подписи", err);
    }
  }
}
