import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, Repository } from "typeorm";

import { RelCreate } from "./dto/rel.create.dto";
import { RelGet } from "./dto/rel.find.dto";
import { RelOrder } from "./dto/rel.order.dto";
import { PaginatedRelResponse } from "./dto/rel.paginated.dto";
import { RelUpdate } from "./dto/rel.update.dto";

import { customError, setErrorGQL } from "../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { RelEntity } from "../../entity/#organization/rel/rel.entity";
import { RelMergeEntity } from "../../entity/#organization/rel/rel.merge.entity";
import { RelTypesEntity } from "../../entity/#organization/rel/relTypes.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { setQueryBuiderRel } from "./rel.utils";

@Injectable()
export class RelService {
  private readonly relRepository: Repository<RelEntity>;
  private readonly relTypesRepository: Repository<RelTypesEntity>;
  private readonly docRepository: Repository<DocEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.relRepository = dataSource.getRepository(RelEntity);
    this.relTypesRepository = dataSource.getRepository(RelTypesEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
  }

  async getRel(
    args: RelGet,
    pagination: PaginationInput,
    orderBy?: RelOrder,
  ): Promise<PaginatedRelResponse | HttpException> {
    try {
      const { pageNumber, pageSize, All } = pagination;
      const qb = this.relRepository.createQueryBuilder("rel");
      setQueryBuiderRel(args, qb, orderBy);
      if (!All) {
        qb.skip((pageNumber - 1) * pageSize);
        qb.take(pageSize);
      }
      const [rel, total] = await qb.getManyAndCount();
      return paginatedResponseResult(rel, pageNumber, pageSize, total);
    } catch (err) {
      return setErrorGQL("Ошибка поиска связки", err);
    }
  }

  async getRelById(id: number): Promise<RelEntity | HttpException> {
    try {
      return await this.relRepository.findOneByOrFail({ id });
    } catch (err) {
      return setErrorGQL("Ошибка поиска связки", err);
    }
  }

  async createRel(args: RelCreate): Promise<RelEntity | HttpException> {
    try {
      const newEntity = this.relRepository.create(args);
      return await this.relRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL("Ошибка создания связки", err);
    }
  }

  async updateRel(id: number, args: RelUpdate): Promise<RelEntity | HttpException> {
    try {
      await this.isExistRec(id);
      await this.relRepository.update(id, args);
      return await this.relRepository.findOneByOrFail({ id });
    } catch (err) {
      return setErrorGQL("Ошибка обновления связки", err);
    }
  }

  // пометить запись как удаленную
  async deleteRel(id: number): Promise<RelEntity | HttpException> {
    try {
      await this.isExistRec(id);
      await this.updateRel(id, { del: true });
      return await this.relRepository.findOneByOrFail({ id });
    } catch (err) {
      return setErrorGQL("Ошибка удаления связки", err);
    }
  }

  // существует ли запись без признака del
  async isExistRec(id: number): Promise<boolean> {
    const rec = await this.getRel({ id }, { ...defaultPaginationValues, All: true });
    if (isInstance(rec, HttpException) || rec["data"]?.length == 0) {
      customError("Не найдена запись связки");
    }
    return true;
  }

  // получить связанные документы
  // не работает извлечение вложенных объктов, например: Doc.Cls.id
  // вопросы с сортировкой по типу и времени
  async getDocRel(doc_id: number, orderBy?: RelOrder): Promise<RelMergeEntity[]> {
    const qb = this.relRepository.createQueryBuilder("rel");
    setQueryBuiderRel({ doc_id: doc_id }, qb, orderBy);
    const data = await qb.getMany();

    const relMerge: RelMergeEntity[] = [];
    for (const rec of data) {
      const relTypes = await rec.RelTypes;
      const direct = rec.doc_direct_id == doc_id;
      const doc = await (direct ? rec.DocReverse : rec.DocDirect);
      relMerge.push({
        id: rec.id,
        date_create: rec.date_create,
        name: direct ? relTypes.name_direct : relTypes.name_reverse,
        direct: direct,
        Doc: doc,
      });
    }
    return relMerge;
  }
}
