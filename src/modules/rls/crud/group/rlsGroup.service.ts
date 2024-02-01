import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, ILike, In, Repository } from "typeorm";

import { customError, setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../../../entity/#organization/emp/emp.entity";
import { RlsGroupEntity } from "../../../../entity/#organization/rls/rls.group.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedRlsGroupResponse,
  RlsGroupDtoCreate,
  RlsGroupDtoDel,
  RlsGroupDtoGet,
  RlsGroupDtoList,
  RlsGroupDtoUpdate,
} from "./rlsGroup.dto";

const ERR = "RLS группы назначений: ошибка ";

@Injectable()
export class RlsGroupService {
  private readonly dataSource: DataSource;
  private readonly rlsGroupRepository: Repository<RlsGroupEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.rlsGroupRepository = dataSource.getRepository(RlsGroupEntity);
  }

  /**
   * LIST
   */
  async listRlsGroup(
    args: RlsGroupDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedRlsGroupResponse | HttpException> {
    try {
      const where = {
        // Emp: { del: false },
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        emp_ids: args?.emp_ids,
        name: args?.name ? ILike(`%${args.name}%`) : undefined,
        note: args?.note ? ILike(`%${args.note}%`) : undefined,
      };
      return await listPaginationData({
        repository: this.rlsGroupRepository,
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
  async getRlsGroup(args: RlsGroupDtoGet): Promise<RlsGroupEntity | HttpException> {
    try {
      return await this.rlsGroupRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createRlsGroup(args: RlsGroupDtoCreate): Promise<RlsGroupEntity | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // запомнить emp_ids
        let emp_ids: number[];
        if (args.emp_ids) {
          emp_ids = args.emp_ids;
          args.emp_ids = undefined;
        }

        // создать запись без emp_ids
        const rlsGroupDto = await manager.create(RlsGroupEntity, args);
        const rlsGroupEntity = await manager.save(RlsGroupEntity, rlsGroupDto);

        // добавить emp_ids
        if (emp_ids) {
          const empEntity = await manager.findBy(EmpEntity, {
            id: In(emp_ids),
            del: false, // не добавлять временные и удаленные назначения
            temp: false,
          });
          if (empEntity?.length != emp_ids?.length) {
            customError("Нельзя использовать удаленные или временные назначения");
          }
          rlsGroupEntity.Emps = empEntity;
          await manager.save(RlsGroupEntity, rlsGroupEntity);
        }

        return rlsGroupEntity;
      });
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateRlsGroup(args: RlsGroupDtoUpdate): Promise<RlsGroupEntity | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const rlsGroupEntity = await manager.findOneOrFail(RlsGroupEntity, {
          relations: ["Emps"],
          where: { id: args.id },
        });

        // связь многое ко многим обновляем только так
        if (args.emp_ids) {
          const empEntity = (rlsGroupEntity.Emps = await manager.findBy(EmpEntity, {
            id: In(args.emp_ids),
            del: false, // не добавлять временные и удаленные назначения
            temp: false,
          }));
          if (empEntity?.length != args.emp_ids?.length) {
            customError("Нельзя использовать удаленные или временные назначения");
          }
          rlsGroupEntity.Emps = empEntity;
          await manager.save(RlsGroupEntity, rlsGroupEntity);
          args.emp_ids = undefined;
        }

        // обновить остальные данные
        await manager.update(RlsGroupEntity, rlsGroupEntity, args);

        return await manager.findOneByOrFail(RlsGroupEntity, { id: args.id });
      });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteRlsGroup(args: RlsGroupDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getRlsGroup(args as RlsGroupDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.rlsGroupRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
