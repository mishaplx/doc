import { HttpException, Inject, Injectable } from "@nestjs/common";
import { isInstance } from "class-validator";
import { DataSource, In, Repository } from "typeorm";

import { customError, setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { RlsAccessEmpEntity } from "../../../../entity/#organization/rls/rls.access.emp.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedRlsAccessEmpResponse,
  RlsAccessEmpDtoCreate,
  RlsAccessEmpDtoDel,
  RlsAccessEmpDtoGet,
  RlsAccessEmpDtoList,
  RlsAccessEmpDtoUpdate,
} from "./rlsAccessEmp.dto";

const ERR = "RLS доступ по назначениям: ошибка ";

@Injectable()
export class RlsAccessEmpService {
  private readonly rlsAccessEmpRepository: Repository<RlsAccessEmpEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.rlsAccessEmpRepository = dataSource.getRepository(RlsAccessEmpEntity);
  }

  /**
   * LIST
   */
  async listRlsAccessEmp(
    args: RlsAccessEmpDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedRlsAccessEmpResponse | HttpException> {
    try {
      const where = {
        // Emp: { del: false },
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        emp_id: args?.emp_id,
        project_id: args?.project_id,
        doc_id: args?.doc_id,
        job_id: args?.job_id,
        read_only: args?.read_only,
      };
      return await listPaginationData({
        repository: this.rlsAccessEmpRepository,
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
  async getRlsAccessEmp(args: RlsAccessEmpDtoGet): Promise<RlsAccessEmpEntity | HttpException> {
    try {
      return await this.rlsAccessEmpRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }

  /**
   * CREATE
   */
  async createRlsAccessEmp(
    args: RlsAccessEmpDtoCreate,
  ): Promise<RlsAccessEmpEntity | HttpException> {
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

      const newEntity = await this.rlsAccessEmpRepository.create(args);
      return await this.rlsAccessEmpRepository.save(newEntity);
    } catch (err) {
      return setErrorGQL(ERR + "создания записи", err);
    }
  }

  /**
   * UPDATE
   */
  async updateRlsAccessEmp(
    args: RlsAccessEmpDtoUpdate,
  ): Promise<RlsAccessEmpEntity | HttpException> {
    try {
      await this.rlsAccessEmpRepository.update(args.id, args);
      return await this.rlsAccessEmpRepository.findOneByOrFail({ id: args.id });
    } catch (err) {
      return setErrorGQL(ERR + "обновления записи", err);
    }
  }

  /**
   * DELETE
   */
  async deleteRlsAccessEmp(args: RlsAccessEmpDtoDel): Promise<boolean | HttpException> {
    try {
      const rec = await this.getRlsAccessEmp(args as RlsAccessEmpDtoGet);
      if (isInstance(rec, HttpException)) throw new Error();

      await this.rlsAccessEmpRepository.delete(args);
      return true;
    } catch (err) {
      return setErrorGQL(ERR + "удаления записи", err);
    }
  }
}
