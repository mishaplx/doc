import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, ILike, In, Repository } from "typeorm";

import {
  NumParamDtoCreate,
  NumParamDtoDel,
  NumParamDtoGet,
  NumParamDtoList,
  NumParamDtoUpdate,
  PaginatedNumParamResponse,
} from "./numParam.dto";

import { setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { NumParamEntity } from "../../../../entity/#organization/num/numParam.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";

const ERR = "Параметры нумератора: ошибка ";

@Injectable()
export class NumParamService {
  private readonly numParamRepository: Repository<NumParamEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.numParamRepository = dataSource.getRepository(NumParamEntity);
  }

  /**
   * LIST
   */
  async listNumParam(
    args: NumParamDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedNumParamResponse | HttpException> {
    try {
      const where = {
        // Emp: { del: false },
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        name: args?.name ? ILike(`%${args.name}%`) : undefined,
        method_name: args?.method_name ? ILike(`%${args.method_name}%`) : undefined,
        method_arg: args?.method_arg ? ILike(`%${args.method_arg}%`) : undefined,
        example: args?.example ? ILike(`%${args.example}%`) : undefined,
        note: args?.note ? ILike(`%${args.note}%`) : undefined,
      };
      return await listPaginationData({
        repository: this.numParamRepository,
        where: where,
        order: { id: "ASC" },
        pagination: pagination,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * GET
   */
  async getNumParam(args: NumParamDtoGet): Promise<NumParamEntity | HttpException> {
    try {
      return await this.numParamRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createNumParam(args: NumParamDtoCreate): Promise<NumParamEntity | HttpException> {
    try {
      const newEntity = await this.numParamRepository.create(args);
      return await this.numParamRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateNumParam(args: NumParamDtoUpdate): Promise<NumParamEntity | HttpException> {
    try {
      await this.numParamRepository.update(args.id, args);
      return await this.numParamRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteNumParam(args: NumParamDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getNumParam(args as NumParamDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.numParamRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
