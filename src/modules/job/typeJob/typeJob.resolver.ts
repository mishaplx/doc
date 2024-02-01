import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { OrderCatalogInput } from "../../../common/argsType/order-catalog-request.dto";
import { TypeJobEntity } from "../../../entity/#organization/typeJob/typeJob.entity";
import { defaultPaginationValues, PaginationInput } from "../../../pagination/paginationDTO";
import { PaginatedOrgResponse } from "../../org/dto/paginated-org-response.dto";
import { CreateTypeOrgDto } from "./dto/createTypeOrg.dto";
import { GetArgTypeJob } from "./dto/get-arg-type-job";
import { OrderTypeJobInput } from "./dto/order-type-job-request.dto";
import { PaginatedTypeJobResponse } from "./dto/pagination-response-typejob";
import { UpdateTypeJobDto } from "./dto/updateTypeJob.dto";
import { TypeJobService } from "./typeJob.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class TypeJobResolver {
  constructor(private TypeJobService: TypeJobService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => TypeJobEntity, {
    description: 'Добавление записи в справочник "тип поручения"',
  })
  createTypeJob(
    @Args("CreateTypeOrgDto") CreateTypeOrgDto: CreateTypeOrgDto,
  ): Promise<TypeJobEntity> {
    return this.TypeJobService.createTypeOrg(CreateTypeOrgDto);
  }

  @Query(() => PaginatedTypeJobResponse, {
    description: 'Получение справочника "тип поручения"',
  })
  getAllTypeJob(
    @Args() args: GetArgTypeJob,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderTypeJobInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedOrgResponse> {
    return this.TypeJobService.getAllTypeJob(args, pagination, order, searchField);
  }
  @Query(() => TypeJobEntity, {
    nullable: true,
    description: 'Получение записи справочника "тип поручения"',
  })
  getTypeJobById(@Args("id", { type: () => Int }) id: number): Promise<TypeJobEntity> {
    return this.TypeJobService.getTypeJobById(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => TypeJobEntity, {
    description: 'Редактирование записи справочника "тип поручения"',
  })
  updategetTypeJob(
    @Args("updateTypeJobInput") updateTypeJobInput: UpdateTypeJobDto,
  ): Promise<TypeJobEntity | HttpException> {
    return this.TypeJobService.updategetTypeJob(updateTypeJobInput);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Организации"',
  })
  removeTypeJob(@Args("id", { type: () => Int }) id: number): Promise<HttpException | boolean> {
    return this.TypeJobService.removeTypeJob(id);
  }
}
