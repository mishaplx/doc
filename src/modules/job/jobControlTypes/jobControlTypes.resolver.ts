import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "src/auth/guard/deactivate.guard";
import { PoliceGuard } from "src/auth/guard/police.guard";
import { JobsControlTypesEntity } from "src/entity/#organization/job/jobControlTypes.entity";
import { PaginationInput, defaultPaginationValues } from "src/pagination/paginationDTO";
import { CreateJobCtrTypeInput } from "./dto/create-jobCtrType.input";
import { GetJobCtrTypeArgs } from "./dto/get-jobCtrType.args";
import { JobsControlTypeUpdate } from "./dto/jobsControlTypesDTO";
import { OrderControlTypesInput } from "./dto/order-control-types-request.dto";
import { PaginatedCtrlResponse } from "./dto/paginated-jobCtrType-response.dto";
import { JobsControlTypesService } from "./jobControlTypes.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class JobsControlTypesResolver {
  constructor(private jobsControlTypesService: JobsControlTypesService) {}

  /**
   * Получение списка типов контроля поручений
   */
  @Query(() => PaginatedCtrlResponse, {
    description: 'Получение справочника "Типы контроля"',
  })
  getAllJobsControlTypes(
    @Args() args: GetJobCtrTypeArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderControlTypesInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedCtrlResponse> {
    return this.jobsControlTypesService.getAllJobsControlTypes(
      args,
      pagination,
      order,
      searchField,
    );
  }

  /**
   * Получение списка типов контроля без пагинации
   */
  @Query(() => [JobsControlTypesEntity], {
    description: "Получение списка типов контроля без пагинации",
  })
  async getAllJobsControlType(): Promise<JobsControlTypesEntity[]> {
    return this.jobsControlTypesService.getAllJobsControlType();
  }

  /**
   * Добавление типа контроля поручений
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => JobsControlTypesEntity, {
    description: 'Добавление записи в справочник "Типы контроля"',
  })
  addJobsControlType(
    @Args("createCtrlInput") createTermInput: CreateJobCtrTypeInput,
  ): Promise<JobsControlTypesEntity> {
    return this.jobsControlTypesService.addJobsControlType(createTermInput);
  }

  /**
   * Редактирование типа контроля поручений
   * @param jobsControlTypeId id типа контроля поручений
   * @param jobsControlTypeItem новые данные типа контроля поручений
   */
  @Mutation(() => JobsControlTypesEntity, {
    description: "Редактирование типа контроля поручений",
  })
  updateJobsControlType(
    // @Args('jobsControlTypeId', {
    //   description: 'id типа контроля поручений',
    //   type: () => Int,
    // })
    // jobsControlTypeId: number,
    @Args("jobsControlTypeItem", {
      description: "Новые данные типа контроля поручения",
    })
    jobsControlTypeItem: JobsControlTypeUpdate,
  ): Promise<JobsControlTypesEntity> {
    return this.jobsControlTypesService.updateJobsControlType(jobsControlTypeItem);
  }

  @Query(() => JobsControlTypesEntity, {
    description: 'Получение по id  "Типы контроля"',
  })
  getJobsControlTypesById(@Args("id") id: number): Promise<JobsControlTypesEntity> {
    return this.jobsControlTypesService.getJobsControlTypesById(id);
  }

  @Mutation(() => Boolean, {
    description: 'Получение по id  "Типы контроля"',
  })
  deleteJobsControlTypesBy(@Args("id") id: number): Promise<boolean> {
    return this.jobsControlTypesService.deleteJobsControlTypesBy(id);
  }
}
