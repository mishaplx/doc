import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, ILike, In, Repository } from "typeorm";

import { customError, setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { NumCountReserveEntity } from "../../../../entity/#organization/num/numCountReserve.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  NumCountReserveDtoCreate,
  NumCountReserveDtoDel,
  NumCountReserveDtoGet,
  NumCountReserveDtoList,
  NumCountReserveDtoUpdate,
  PaginatedNumCountReserveResponse,
} from "./numCountReserve.dto";

const ERR = "Зарезервированные номера счетчика нумератора: ошибка ";

@Injectable()
export class NumCountReserveService {
  private readonly numCountReserveRepository: Repository<NumCountReserveEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.numCountReserveRepository = dataSource.getRepository(NumCountReserveEntity);
  }

  /**
   * LIST
   */
  async listNumCountReserve(
    args: NumCountReserveDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedNumCountReserveResponse | HttpException> {
    try {
      const where = {
        // Emp: { del: false },
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        num_id: args?.num_id,
        emp_id: args?.emp_id,
        date: args?.date,
        val: args?.val,
        note: args?.note ? ILike(`%${args.note}%`) : undefined,
      };
      return await listPaginationData({
        repository: this.numCountReserveRepository,
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
  async getNumCountReserve(
    args: NumCountReserveDtoGet,
  ): Promise<NumCountReserveEntity | HttpException> {
    try {
      return await this.numCountReserveRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createNumCountReserve(
    args: NumCountReserveDtoCreate,
  ): Promise<NumCountReserveEntity | HttpException> {
    try {
      // зарезервирован ли номер ранее
      const rec = await this.listNumCountReserve({
        num_id: args.num_id,
        val: args.val,
      });
      if (isInstance(rec, HttpException)) setErrorGQL("");
      if ((rec as PaginatedNumCountReserveResponse)?.metadata?.recordsNumber > 0) {
        customError("Номер " + args.val + " зарезервирован ранее!");
      }

      const newEntity = await this.numCountReserveRepository.create(args);
      return await this.numCountReserveRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateNumCountReserve(
    args: NumCountReserveDtoUpdate,
  ): Promise<NumCountReserveEntity | HttpException> {
    try {
      await this.numCountReserveRepository.update(args.id, args);
      return await this.numCountReserveRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteNumCountReserve(args: NumCountReserveDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getNumCountReserve(args as NumCountReserveDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.numCountReserveRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
