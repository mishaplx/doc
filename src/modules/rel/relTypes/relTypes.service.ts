import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { Brackets, DataSource, Repository } from "typeorm";

import { RelTypesCreate } from "./dto/relTypes.create.dto";
import { RelTypesGet } from "./dto/relTypes.find.dto";
import { PaginatedRelTypesResponse } from "./dto/relTypes.paginated.dto";
import { RelTypesUpdate } from "./dto/relTypes.update.dto";

import { customError, setErrorGQL } from "../../../common/type/errorHelper.type";
import { searchAllColumnWithoutRelation } from "../../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { RelTypesEntity } from "../../../entity/#organization/rel/relTypes.entity";
import { getPaginatedData, paginatedResponseResult } from "../../../pagination/pagination.service";
import { PaginationInput } from "../../../pagination/paginationDTO";
import { OrderRefTypesInput } from "./dto/order-reftypes-request.dto";
import { getOrderAllRelTypes, getWhereAllRelTypes } from "./relTypes.utils";

@Injectable()
export class RelTypesService {
  private readonly relTypesRepository: Repository<RelTypesEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.relTypesRepository = dataSource.getRepository(RelTypesEntity);
  }

  async getRelTypes(
    args: RelTypesGet,
    pagination: PaginationInput,
    orderBy: OrderRefTypesInput,
    searchField: string,
  ): Promise<PaginatedRelTypesResponse | HttpException> {
    try {
      const where = getWhereAllRelTypes(args);
      const order = getOrderAllRelTypes(orderBy);
      const { pageNumber, pageSize } = pagination;
      if (searchField?.trim()) {
        const [rels, total] = await searchAllColumnWithoutRelation(
          this.relTypesRepository,
          searchField,
          pageNumber,
          pageSize,
        );
        return paginatedResponseResult(rels, pageNumber, pageSize, total);
      }
      const [rels, total] = await getPaginatedData(
        this.relTypesRepository,
        pageNumber,
        pageSize,
        where,
        false,
        null,
        order,
      );

      return await paginatedResponseResult(rels, pageNumber, pageSize, total);
    } catch (err) {
      return setErrorGQL("Ошибка поиска типа связки", err);
    }
  }

  async getRelTypesById(id: number): Promise<RelTypesEntity | HttpException> {
    try {
      const rec = await this.relTypesRepository.findOneByOrFail({ id });
      if (rec == null) {
        customError("Не найдена запись типа связки");
      }
      return rec;
    } catch (err) {
      return setErrorGQL("Ошибка поиска типа связки", err);
    }
  }

  async createRelTypes(args: RelTypesCreate): Promise<RelTypesEntity | HttpException> {
    try {
      // корректность параметров
      if (args.name_direct == "" || args.name_reverse == "") {
        customError("Названия типов связок не могут быть пустыми");
      }
      if (args.name_direct == args.name_reverse) {
        customError("Названия типов связок не могут быть одинаковыми");
      }

      // допустимо ли создать запись
      if (
        !(await this.isValidRecTypes({
          name_direct: args.name_direct,
          name_reverse: args.name_reverse,
        }))
      ) {
        customError("Запись типа связки не должна повторяться");
      }
      const newEntity = this.relTypesRepository.create(args);
      return await this.relTypesRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL("Ошибка создания типа связки", err);
    }
  }

  async updateRelTypes(id: number, args: RelTypesUpdate): Promise<RelTypesEntity | HttpException> {
    try {
      // корректность параметров
      if (
        (args.name_direct && args.name_direct == "") ||
        (args.name_reverse && args.name_reverse == "")
      ) {
        customError("Названия в типах связок не могут быть пустыми");
      }
      if (args.name_direct && args.name_reverse && args.name_direct == args.name_reverse) {
        customError("Названия типов связок не могут быть одинаковыми");
      }

      // существует ли запись
      const rec0 = await this.getRelTypesById(id);
      if (isInstance(rec0, HttpException) || rec0 == null) {
        customError("Тип связки не найден");
      }

      // допустимо ли редактировать запись(повторы не допустимы)
      if (args?.name_direct || args?.name_reverse) {
        const rec = rec0 as RelTypesEntity;
        if (
          !(await this.isValidRecTypes({
            id: id,
            name_direct: args?.name_direct,
            name_reverse: args?.name_reverse,
          }))
        ) {
          customError("Тип связки не должен повторяться");
        }
      }

      await this.relTypesRepository.update(id, args);
      return await this.relTypesRepository.findOneByOrFail({ id });
    } catch (err) {
      return setErrorGQL("Ошибка обновления типа связки", err);
    }
  }

  // пометить запись как удаленную
  async deleteRelTypes(id: number): Promise<RelTypesEntity | HttpException> {
    try {
      await this.getRelTypesById(id);
      await this.updateRelTypes(id, { del: true });
      return await this.relTypesRepository.findOneByOrFail({ id });
    } catch (err) {
      return setErrorGQL("Ошибка удаления типа связки", err);
    }
  }

  // допустимо ли создать запись
  async isValidRecTypes(args: {
    id?: number;
    name_direct?: string;
    name_reverse?: string;
  }): Promise<boolean> {
    const qb = this.relTypesRepository
      .createQueryBuilder("rel_types")
      .where("rel_types.del = false");

    // при наличии id проверяем все записи на повтор, кроме записи с этим id
    if (args?.id) {
      qb.andWhere("id != :id");
    }

    if (args?.name_direct || args?.name_reverse) {
      qb.andWhere(
        new Brackets((qb2) => {
          let first = true;
          if (args?.name_direct) {
            qb2
              .where("rel_types.name_direct = :name_direct")
              .orWhere("rel_types.name_reverse = :name_direct");
            first = false;
          }
          if (args?.name_reverse) {
            if (first) qb2.where("rel_types.name_direct = :name_reverse");
            else qb2.orWhere("rel_types.name_direct = :name_reverse");
            qb2.orWhere("rel_types.name_reverse = :name_reverse");
          }
        }),
      );
    }

    const ret = await qb
      .setParameters({
        id: args?.id,
        name_direct: args?.name_direct,
        name_reverse: args?.name_reverse,
      })
      .getOne();
    return ret == null;
  }
}
