import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { CreateOrgInput } from "./dto/create-org.input";
import { GetOrgsArgs } from "./dto/get-orgs.args";
import { OrderOrgInput } from "./dto/order-org-request.dto";
import { PaginatedOrgResponse } from "./dto/paginated-org-response.dto";
import { UpdateOrgInput } from "./dto/update-org.input";
import { OrgService } from "./org.service";
@UseGuards(DeactivateGuard)
@Resolver(() => OrgEntity)
export class OrgResolver {
  constructor(private readonly orgService: OrgService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => OrgEntity, {
    description: 'Добавление записи в справочник "Организации"',
  })
  createOrg(@Args("createOrgInput") createOrgInput: CreateOrgInput): Promise<OrgEntity> {
    return this.orgService.create(createOrgInput);
  }

  @Query(() => PaginatedOrgResponse, {
    description: 'Получение справочника "Организации"',
  })
  getAllOrgs(
    @Args() args: GetOrgsArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderOrgInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedOrgResponse> {
    return this.orgService.findAll(args, pagination, order, searchField);
  }

  @Query(() => [OrgEntity], {
    description: 'Получение справочника "Организации"',
  })
  getAllOrg(): Promise<OrgEntity[]> {
    return this.orgService.getAllOrg();
  }

  @Query(() => OrgEntity, {
    nullable: true,
    description: 'Получение записи справочника "Организации"',
  })
  getOrgById(@Args("id", { type: () => Int }) id: number): Promise<OrgEntity> {
    return this.orgService.findOne(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => OrgEntity, {
    description: 'Редактирование записи справочника "Организации"',
  })
  updateOrg(@Args("updateOrgInput") updateOrgInput: UpdateOrgInput): Promise<OrgEntity> {
    return this.orgService.update(updateOrgInput.idOrg, updateOrgInput);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Организации"',
  })
  removeOrg(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.orgService.remove(id);
  }
}
