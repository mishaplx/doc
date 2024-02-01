import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { setErrorGQL } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { reserveNumTickUtil, takeNumTickUtil, unreserveNumTickUtil } from "./numTick.util";

const ERR = "Счетчик нумератора: ошибка ";

@Injectable()
export class NumTickService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) { }

  /**
   * СЧЕТЧИК: ЗАРЕЗЕРВИРОВАТЬ НОМЕР
   */
  async reserveNumTick(args: {
    num_id: number;
    privat: boolean;
    note: string;
    emp_id: number;
  }): Promise<number | HttpException> {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await reserveNumTickUtil({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return setErrorGQL(ERR + "резервирования номера", err);
    }
  }

  /**
   * СЧЕТЧИК: СНЯТЬ РЕЗЕРВ НОМЕРА
   */
  async unreserveNumTick(args: {
    num_id: number;
    val: number;
    emp_id: number;
  }): Promise<number | HttpException> {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await unreserveNumTickUtil({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return setErrorGQL(ERR + "снятия резерва номера", err);
    }
  }

  /**
   * СЧЕТЧИК: ВЗЯТЬ НОМЕР
   */
  async takeNumTick(args: {
    emp_id: number;
    num_id: number;
    val?: number;
    only_queue?: boolean;
    prepare?: boolean;
  }): Promise<number | HttpException> {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await takeNumTickUtil({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return setErrorGQL(ERR + "получения номера", err);
    }
  }
}
