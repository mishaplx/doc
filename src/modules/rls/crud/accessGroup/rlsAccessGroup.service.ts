import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, In, Repository } from "typeorm";

import { customError, setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { RlsAccessGroupEntity } from "../../../../entity/#organization/rls/rls.access.group.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedRlsAccessGroupResponse,
  RlsAccessGroupDtoCreate,
  RlsAccessGroupDtoDel,
  RlsAccessGroupDtoGet,
  RlsAccessGroupDtoList,
  RlsAccessGroupDtoUpdate,
} from "./rlsAccessGroup.dto";

const ERR = "RLS доступ по группам назначений: ошибка ";

@Injectable()
export class RlsAccessGroupService {
  private readonly rlsAccessGroupRepository: Repository<RlsAccessGroupEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.rlsAccessGroupRepository = dataSource.getRepository(RlsAccessGroupEntity);
  }

  /**
   * LIST
   */
  async listRlsAccessGroup(
    args: RlsAccessGroupDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedRlsAccessGroupResponse | HttpException> {
    try {
      const where = {
        // Emp: { del: false },
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        rls_group_id: args?.rls_group_id,
        project_id: args?.project_id,
        doc_id: args?.doc_id,
        job_id: args?.job_id,
        read_only: args?.read_only,
      };
      return await listPaginationData({
        repository: this.rlsAccessGroupRepository,
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
  async getRlsAccessGroup(
    args: RlsAccessGroupDtoGet,
  ): Promise<RlsAccessGroupEntity | HttpException> {
    try {
      return await this.rlsAccessGroupRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createRlsAccessGroup(
    args: RlsAccessGroupDtoCreate,
  ): Promise<RlsAccessGroupEntity | HttpException> {
    try {
      // блокировки
      let i = 0;
      if (args.doc_id) i++;
      if (args.project_id) i++;
      if (args.job_id) i++;
      if (i != 1) {
        customError(
          "RLS группа доступа должна быть связана с одним документом или проектом документа или поручением",
        );
      }

      const newEntity = await this.rlsAccessGroupRepository.create(args);
      return await this.rlsAccessGroupRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateRlsAccessGroup(
    args: RlsAccessGroupDtoUpdate,
  ): Promise<RlsAccessGroupEntity | HttpException> {
    try {
      await this.rlsAccessGroupRepository.update(args.id, args);
      return await this.rlsAccessGroupRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteRlsAccessGroup(args: RlsAccessGroupDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getRlsAccessGroup(args as RlsAccessGroupDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.rlsAccessGroupRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
