import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, In, Repository } from "typeorm";

import {
  NumCountHistoryDtoCreate,
  NumCountHistoryDtoDel,
  NumCountHistoryDtoGet,
  NumCountHistoryDtoList,
  PaginatedNumCountHistoryResponse,
} from "./numCountHistory.dto";

import { setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { NumCountHistoryEntity } from "../../../../entity/#organization/num/numCountHistory.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";

const ERR = "История счетчика нумератора: ошибка ";

@Injectable()
export class NumCountHistoryService {
  private readonly numCountHistoryRepository: Repository<NumCountHistoryEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.numCountHistoryRepository = dataSource.getRepository(NumCountHistoryEntity);
  }

  /**
   * LIST
   */
  async listNumCountHistory(
    args: NumCountHistoryDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedNumCountHistoryResponse | HttpException> {
    try {
      const where = {
        // Emp: { del: false },
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        num_id: args?.num_id,
        date: args?.date,
        val: args?.val,
        reset: args?.reset,
      };
      return await listPaginationData({
        repository: this.numCountHistoryRepository,
        where: where,
        pagination: pagination,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * GET
   */
  async getNumCountHistory(
    args: NumCountHistoryDtoGet,
  ): Promise<NumCountHistoryEntity | HttpException> {
    try {
      return await this.numCountHistoryRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createNumCountHistory(
    args: NumCountHistoryDtoCreate,
  ): Promise<NumCountHistoryEntity | HttpException> {
    try {
      const newEntity = await this.numCountHistoryRepository.create(args);
      return await this.numCountHistoryRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  // отключено за ненадобностью
  // /**
  //  * UPDATE
  //  */
  // async updateNumCountHistory(
  //   args: NumCountHistoryDtoUpdate,
  //   ): Promise<NumCountHistoryEntity | HttpException> {
  //   try {
  //     await this.numCountHistoryRepository.update(args.id, args);
  //     return await this.numCountHistoryRepository.findOneByOrFail({ id: args.id });
  //   } catch (err) {
  //     return setErrorGQL(ERR+'обновления записи', err);
  //   }
  // }

  /**
   * DELETE
   */
  async deleteNumCountHistory(args: NumCountHistoryDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getNumCountHistory(args as NumCountHistoryDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.numCountHistoryRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
