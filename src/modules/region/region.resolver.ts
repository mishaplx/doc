import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { GetDirectoriesArgs } from "../../common/argsType/get-directories.args";
import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { RegionEntity } from "../../entity/#organization/region/region.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { CreateRegionInput } from "./dto/create-region.input";
import { PaginatedRegionResponse } from "./dto/paginated-region-response.dto";
import { UpdateRegionInput } from "./dto/update-region.input";
import { RegionService } from "./region.service";
@UseGuards(DeactivateGuard)
@Resolver(() => RegionEntity)
export class RegionResolver {
  constructor(private readonly regionService: RegionService) {}

  @Mutation(() => RegionEntity, {
    description: 'Добавление записи в справочник "Регионы"',
  })
  createRegion(
    @Args("createRegionInput") createRegionInput: CreateRegionInput,
  ): Promise<RegionEntity> {
    return this.regionService.create(createRegionInput);
  }

  @Query(() => PaginatedRegionResponse, {
    description: 'Получение справочника "Регионы"',
  })
  regions(
    @Args() args: GetDirectoriesArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderCatalogInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedRegionResponse> {
    return this.regionService.findAll(args, pagination, order, searchField);
  }

  @Query(() => RegionEntity, {
    nullable: true,
    description: 'Получение записи справочника "Регионы"',
  })
  region(@Args("id", { type: () => Int }) id: number): Promise<RegionEntity> {
    return this.regionService.findOne(id);
  }

  @Mutation(() => RegionEntity, {
    description: 'Редактирование записи справочника "Регионы"',
  })
  updateRegion(
    @Args("updateRegionInput") updateRegionInput: UpdateRegionInput,
  ): Promise<RegionEntity> {
    return this.regionService.update(updateRegionInput.id, updateRegionInput);
  }

  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Регионы"',
  })
  removeRegion(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.regionService.remove(id);
  }
}
