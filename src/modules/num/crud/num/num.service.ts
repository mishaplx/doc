import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { Brackets, DataSource, In, Repository } from "typeorm";

import { customError, setErrorGQL } from "../../../../common/type/errorHelper.type";
import { globalSearchBuilderNum } from "../../../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { TdocEntity } from "../../../../entity/#organization/doc/tdoc.entity";
import { NumEntity } from "../../../../entity/#organization/num/num.entity";
import { NumParamSelEntity } from "../../../../entity/#organization/num/numParamSel.entity";
import { UnitEntity } from "../../../../entity/#organization/unit/unit.entity";
import { paginatedResponseResult } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  GetNumArgs,
  NumDtoCreate,
  NumDtoDel,
  NumDtoGet,
  NumDtoUpdate,
  OrderNumInput,
  PaginatedNumResponse,
} from "./num.dto";
import { setQueryBuilderNum } from "./num.utils";

const ERR = "Нумератор: ошибка ";

@Injectable()
export class NumService {
  private readonly dataSource: DataSource;
  private readonly numRepository: Repository<NumEntity>;
  private readonly tdocRepository: Repository<TdocEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.numRepository = dataSource.getRepository(NumEntity);
    this.tdocRepository = dataSource.getRepository(TdocEntity);
  }

  /**
   * LIST
   */
  async listNum(
    args: GetNumArgs,
    pagination: PaginationInput,
    orderBy: OrderNumInput,
    searchField: string,
  ): Promise<PaginatedNumResponse | HttpException> {
    try {
      const queryBuilder = this.numRepository.createQueryBuilder("num");
      const { pageNumber, pageSize, All } = pagination;
      if (searchField?.trim()) {
        globalSearchBuilderNum(queryBuilder, searchField);
      } else {
        setQueryBuilderNum(args, orderBy, queryBuilder);
      }

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }

      const [nums, total] = await queryBuilder.getManyAndCount();
      const result = paginatedResponseResult(nums, pageNumber, pageSize, total);
      for (const item of result.data) {
        for (const numParamSel of await item.NumParamSel) {
          if ((await numParamSel.NumParam).example === "INPUT") {
            (await numParamSel.NumParam).example = numParamSel.value;
            (await numParamSel.NumParam).name = `${(await numParamSel.NumParam).name} "${
              numParamSel.value
            }"`;
          }
        }
      }
      return result;
    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * GET
   */
  async getNum(args: NumDtoGet): Promise<NumEntity | HttpException> {
    try {
      const result = await this.numRepository.findOneOrFail({
        relations: { NumParamSel: true },
        where: { id: args.id },
        order: { NumParamSel: { sort: "ASC" } },
      });
      for (const item of await result.NumParamSel) {
        if ((await item.NumParam).example === "INPUT") {
          (await item.NumParam).example = item.value;
          (await item.NumParam).name = `${(await item.NumParam).name} "${item.value}"`;
        }
      }
      return result;
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createNum(args: NumDtoCreate): Promise<NumEntity | HttpException> {
    try {
      let numEntity: NumEntity;
      await this.dataSource.transaction(async (manager) => {
        // запомнить num_param_ids
        let num_param_ids: number[];
        let num_param_values: string[];
        if (args.num_param_ids) {
          num_param_ids = args.num_param_ids;
          num_param_values = args.num_param_values;
          args.num_param_ids = undefined;
          args.num_param_values = undefined;
        }

        // проверить на допустимость
        const qbuilder = manager
          .createQueryBuilder(NumEntity, 'num')
          .leftJoin("num.Tdocs", "Tdocs")
          .leftJoin("num.Units", "Units")
          .select("num.id")
          .where("kdoc_id = :kdoc_id", { kdoc_id: args.kdoc_id});
        if (args.tdoc_ids?.length > 0) {
          qbuilder.andWhere("Tdocs.id In (:...tdoc_ids)", { tdoc_ids: args.tdoc_ids});
        }
        if (args.unit_ids?.length > 0) {
          qbuilder.andWhere("Units.id In (:...unit_ids)", { unit_ids: args.unit_ids});
        }
        if (args.date_end) {
          qbuilder.andWhere("date_start < :date_end", { date_end: args.date_end });
        }
        if (args.date_start) {
          qbuilder.andWhere("date_end > :date_start", { date_start: args.date_start });
        }
        const numEntityList = await qbuilder.getMany();
        if (numEntityList.length) {
          customError(ERR + "- создан ранее");
        }

        // создать запись без num_param_ids
        const numDto = await manager.create(NumEntity, args);
        numEntity = await manager.save(NumEntity, numDto);

        if (!args.tdoc_ids) args.tdoc_ids = [];
        if (args.tdoc_ids) {
          numEntity = await manager.findOneOrFail(NumEntity, {
            where: { id: numEntity.id },
            relations: ["Tdocs"],
          });
          numEntity.Tdocs = await manager.findBy(TdocEntity, {
            id: In(args.tdoc_ids),
          });
          await manager.save(NumEntity, numEntity);
          args.tdoc_ids = undefined;
        }

        if (!args.unit_ids) args.unit_ids = [];
        if (args.unit_ids) {
          numEntity = await manager.findOneOrFail(NumEntity, {
            where: { id: numEntity.id },
            relations: ["Units"],
          });
          numEntity.Units = await manager.findBy(UnitEntity, {
            id: In(args.unit_ids),
          });
          await manager.save(NumEntity, numEntity);
          args.unit_ids = undefined;
        }

        if (num_param_ids) {
          const numParamSelDto = num_param_ids.map((param_id, ind) => ({
            num_id: numEntity.id,
            num_param_id: param_id,
            value: num_param_values[ind] || null,
            sort: ind,
          }));
          await manager.save(NumParamSelEntity, numParamSelDto);
        }

        numEntity = await manager.findOneBy(NumEntity, { id: numEntity.id });
      });
      return numEntity;
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateNum(args: NumDtoUpdate): Promise<NumEntity | HttpException> {
    try {
      await this.dataSource.transaction(async (manager) => {
        if (args.tdoc_ids) {
          const rec_num = await manager.findOneOrFail(NumEntity, {
            where: { id: args.id },
            relations: ["Tdocs"],
          });
          rec_num.Tdocs = await manager.findBy(TdocEntity, {
            id: In(args.tdoc_ids),
          });
          await manager.save(NumEntity, rec_num);
          args.tdoc_ids = undefined;
        }

        if (args.unit_ids) {
          const rec_num = await manager.findOneOrFail(NumEntity, {
            where: { id: args.id },
            relations: ["Units"],
          });
          rec_num.Units = await manager.findBy(UnitEntity, {
            id: In(args.unit_ids),
          });
          await manager.save(NumEntity, rec_num);
          args.unit_ids = undefined;
        }

        if (args.num_param_ids) {
          await manager.delete(NumParamSelEntity, { num_id: args.id });
          const numParamSelDto = args.num_param_ids.map((param_id, ind) => ({
            num_id: args.id,
            num_param_id: param_id,
            value: args.num_param_values[ind] || null,
            sort: ind,
          }));
          await manager.save(NumParamSelEntity, numParamSelDto);
          args.num_param_ids = undefined;
          args.num_param_values = undefined;
        }

        await manager.update(NumEntity, args.id, args);
      });
      return await this.numRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteNum(args: NumDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getNum(args as NumDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.numRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
