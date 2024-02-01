import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CitizenService } from "./citizen.service";
import { createCitizenInput } from "./dto/create-org.input";
import { PaginatedCitizenResponse } from "./dto/paginated-org-response.dto";
import { updateCitizenInput } from "./dto/update-org.input";

import { UseGuards } from "@nestjs/common";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { CitizenEntity } from "../../entity/#organization/citizen/citizen.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetCitizenArgs } from "./dto/get-citizen.args";
import { OrderCitizenInput } from "./dto/order-citizen-request.dto";

@UseGuards(DeactivateGuard)
@Resolver(() => CitizenEntity)
export class CitizenResolver {
  constructor(private readonly citizenService: CitizenService) {}
  @UseGuards(PoliceGuard)
  @Mutation(() => CitizenEntity, {
    description: 'Добавление записи в справочник "Граждане- (физ.лица)"',
  })
  createCitizen(
    @Args("createCitizenInput") createCitizenInput: createCitizenInput,
  ): Promise<CitizenEntity> {
    return this.citizenService.create(createCitizenInput);
  }

  @Query(() => PaginatedCitizenResponse, {
    description: 'Получение справочника "Граждане- (физ.лица)"',
  })
  getAllCitizen(
    @Args() args: GetCitizenArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderCitizenInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedCitizenResponse> {
    return this.citizenService.getAllCitizen(args, pagination, order, searchField);
  }

  @Query(() => CitizenEntity, {
    nullable: true,
    description: 'Получение записи справочника "Граждане- (физ.лица)"',
  })
  getCitizenById(@Args("id", { type: () => Int }) id: number): Promise<CitizenEntity> {
    return this.citizenService.getCitizenById(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => CitizenEntity, {
    description: 'Редактирование записи справочника "Граждане- (физ.лица)"',
  })
  updateCitizen(
    @Args("updateOrgInput") updateOrgInput: updateCitizenInput,
  ): Promise<CitizenEntity> {
    return this.citizenService.updateCitizen(updateOrgInput.id, updateOrgInput);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Граждане- (физ.лица)"',
  })
  deleteCitizen(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.citizenService.deleteCitizen(id);
  }
}
