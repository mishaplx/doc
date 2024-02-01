import { Inject, Injectable } from "@nestjs/common";
import { OrderControlTypesEnum } from "src/common/enum/enum";
import { DATA_SOURCE } from "src/database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { JobsControlTypesEntity } from "src/entity/#organization/job/jobControlTypes.entity";
import { PostEntity } from "src/entity/#organization/post/post.entity";
import { StaffEntity } from "src/entity/#organization/staff/staff.entity";
import { UserEntity } from "src/entity/#organization/user/user.entity";
import { getPaginatedData, paginatedResponseResult } from "src/pagination/pagination.service";
import { PaginationInput } from "src/pagination/paginationDTO";
import { DataSource, EntityManager, Repository } from "typeorm";
import { globalSearchDocBuilderJobsControlTypes, searchAllColumnWithoutRelation } from "../../../common/utils/utils.global.search";
import { wLogger } from "../../logger/logging.module";
import { GetJobCtrTypeArgs } from "./dto/get-jobCtrType.args";
import { JobsControlTypeUpdate } from "./dto/jobsControlTypesDTO";
import { OrderControlTypesInput } from "./dto/order-control-types-request.dto";
import { PaginatedCtrlResponse } from "./dto/paginated-jobCtrType-response.dto";
import { setQueryBuilderJobsControlTypes } from "./jobCtrType.utils";

interface Controller {
  emp_id: number;
  controller: string;
}
@Injectable()
export class JobsControlTypesService {
  private readonly jobsControlTypesRepository: Repository<JobsControlTypesEntity>;
  private readonly dataSource: DataSource;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.jobsControlTypesRepository = dataSource.getRepository(JobsControlTypesEntity);
    this.dataSource = dataSource;
  }

  async getAllJobsControlTypes(
    args: GetJobCtrTypeArgs,
    pagination: PaginationInput,
    orderBy: OrderControlTypesInput,
    searchField: string,
  ): Promise<PaginatedCtrlResponse> {
    await this.updateControllerNames();
    const queryBuilder = this.jobsControlTypesRepository.createQueryBuilder("jobs_control_types");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchDocBuilderJobsControlTypes(queryBuilder, searchField);
    } else {
      setQueryBuilderJobsControlTypes(args, orderBy, queryBuilder);

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }
    }

    const [docs, total] = await queryBuilder.getManyAndCount();
    return paginatedResponseResult(docs, pageNumber, pageSize, total);
  }

  async updateControllerNames(): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const controlTypes = await manager.find(JobsControlTypesEntity, {});
      const foundControllers: Controller[] = [];
      for (const controlType of controlTypes) {
        let controller: string;
        const findController = foundControllers.find((x) => x.emp_id === controlType.controller_id);
        if (findController) controller = findController.controller;
        else {
          const emp = await manager.findOne(EmpEntity, {
            where: {
              id: controlType.controller_id,
            },
          });
          const user = await manager.findOne(UserEntity, {
            where: {
              current_emp_id: emp.id,
            },
          });
          const post = await manager.findOne(PostEntity, {
            where: {
              id: emp.post_id,
            },
          });
          if (user) {
            const staff = await manager.findOne(StaffEntity, {
              where: {
                user_id: user.id,
              },
            });
            controller = `${staff.FIO} / ${post.nm}`;
            foundControllers.push({ emp_id: controlType.controller_id, controller });
          }

          await manager.save(JobsControlTypesEntity, { id: controlType.id, controller });
        }
      }
    });
  }

  async getAllJobsControlType(): Promise<JobsControlTypesEntity[]> {
    return this.jobsControlTypesRepository.findBy({ temp: false });
  }

  async addJobsControlType(createTermInput): Promise<JobsControlTypesEntity> {
    const result = await this.jobsControlTypesRepository.save(createTermInput);
    return result;
  }

  async updateJobsControlType(
    jobsControlTypeItem: JobsControlTypeUpdate,
  ): Promise<JobsControlTypesEntity> {
    const oldJobsControlType = await this.jobsControlTypesRepository.findOneByOrFail({
      id: jobsControlTypeItem.id,
    });
    await this.jobsControlTypesRepository.update(
      { id: oldJobsControlType.id },
      jobsControlTypeItem,
    );
    return this.jobsControlTypesRepository.findOne({
      where: { id: jobsControlTypeItem.id },
    });
  }
  async getJobsControlTypesById(id): Promise<JobsControlTypesEntity> {
    return await this.jobsControlTypesRepository.findOne({
      where: {
        id: id,
      },
    });
  }
  async deleteJobsControlTypesBy(id): Promise<boolean> {
    try {
      await this.jobsControlTypesRepository.update(
        { id: id },
        {
          del: true,
        },
      );
      return true;
    } catch (e) {
      wLogger.error(e);
      return false;
    }
  }
}
