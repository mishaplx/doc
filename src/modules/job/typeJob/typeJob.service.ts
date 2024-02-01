import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { JobsControlTypesEntity } from "src/entity/#organization/job/jobControlTypes.entity";
import { PostEntity } from "src/entity/#organization/post/post.entity";
import { StaffEntity } from "src/entity/#organization/staff/staff.entity";
import { UserEntity } from "src/entity/#organization/user/user.entity";
import { DataSource, EntityManager, Repository } from "typeorm";

import { OrderCatalogInput } from "../../../common/argsType/order-catalog-request.dto";
import { OrderCatalogEnum } from "../../../common/enum/enum";
import { globalSearchDocBuilderTypeJob, searchAllColumnWithoutRelation } from "../../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { getWhereFindAll } from "../../../directories/directories.utils";
import { TypeJobEntity } from "../../../entity/#organization/typeJob/typeJob.entity";
import {
  listPaginationData,
  paginatedResponseResult,
} from "../../../pagination/pagination.service";
import { PaginationInput } from "../../../pagination/paginationDTO";
import { wLogger } from "../../logger/logging.module";
import { CreateTypeOrgDto } from "./dto/createTypeOrg.dto";
import { GetArgTypeJob } from "./dto/get-arg-type-job";
import { OrderTypeJobInput } from "./dto/order-type-job-request.dto";
import { PaginatedTypeJobResponse } from "./dto/pagination-response-typejob";
import { UpdateTypeJobDto } from "./dto/updateTypeJob.dto";
import { setQueryBuilderTypeJob } from "./typeJob.utils";

@Injectable()
export class TypeJobService {
  public dataSource: DataSource;
  private readonly TypeJobRepository: Repository<TypeJobEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.TypeJobRepository = dataSource.getRepository(TypeJobEntity);
  }

  async createTypeOrg(createTypeOrgDto: CreateTypeOrgDto): Promise<TypeJobEntity> {
    createTypeOrgDto.del = false;
    createTypeOrgDto.temp = false;
    return await this.TypeJobRepository.save(createTypeOrgDto);
  }

  async getAllTypeJob(
    args: GetArgTypeJob,
    pagination: PaginationInput,
    orderBy: OrderTypeJobInput,
    searchField: string,
  ): Promise<PaginatedTypeJobResponse> {
    await this.updateDefaultEmpNames();

    const queryBuilder = this.TypeJobRepository.createQueryBuilder("type_job");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchDocBuilderTypeJob(queryBuilder, searchField);
    } else {
      setQueryBuilderTypeJob(args, orderBy, queryBuilder);

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }
    }

    const [docs, total] = await queryBuilder.getManyAndCount();
    return paginatedResponseResult(docs, pageNumber, pageSize, total);
  }

  async updateDefaultEmpNames(): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const typeJobs = await manager.find(TypeJobEntity, {});
      const foundAuthors = [];
      for (const typeJob of typeJobs) {
        let defaultEmp: string;
        const findAuthor = foundAuthors.find((x) => x.emp_id === typeJob.default_emp_id);
        if (findAuthor) defaultEmp = findAuthor.default_emp;
        else {
          const emp = await manager.findOne(EmpEntity, {
            where: {
              id: typeJob.default_emp_id,
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
            defaultEmp = `${staff.FIO} / ${post.nm}`;
            foundAuthors.push({ emp_id: typeJob.default_emp_id, default_emp: defaultEmp });
          }
        }
        await manager.save(TypeJobEntity, { id: typeJob.id, default_emp: defaultEmp });
      }
    });
  }

  async getTypeJobById(id: number): Promise<TypeJobEntity> {
    return await this.TypeJobRepository.findOne({
      where: {
        id: id,
      },
    });
  }
  async removeTypeJob(id: number): Promise<HttpException | boolean> {
    try {
      await this.TypeJobRepository.update(
        {
          id: id,
        },
        {
          del: true,
        },
      );
      return true;
    } catch (e) {
      wLogger.error(e);
      return new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }

  async updategetTypeJob(
    UpdateTypeJobDto: UpdateTypeJobDto,
  ): Promise<TypeJobEntity | HttpException> {
    const { id, ...upadteType } = UpdateTypeJobDto;
    await this.TypeJobRepository.findOne({
      where: {
        id: UpdateTypeJobDto.id,
      },
    });
    try {
      await this.TypeJobRepository.update(
        {
          id: UpdateTypeJobDto.id,
        },
        upadteType,
      );
      const typeJob = await this.TypeJobRepository.findOne({
        where: {
          id: UpdateTypeJobDto.id,
        },
      });
      return typeJob;
    } catch (e) {
      wLogger.error(e);
      return new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
}
