import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { RelTypesCreate } from "./dto/relTypes.create.dto";
import { RelTypesGet } from "./dto/relTypes.find.dto";
import { PaginatedRelTypesResponse } from "./dto/relTypes.paginated.dto";
import { RelTypesUpdate } from "./dto/relTypes.update.dto";

import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { RelTypesEntity } from "../../../entity/#organization/rel/relTypes.entity";
import { defaultPaginationValues, PaginationInput } from "../../../pagination/paginationDTO";
import { OrderRefTypesInput } from "./dto/order-reftypes-request.dto";
import { RelTypesService } from "./relTypes.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class RelTypesResolver {
  constructor(private relTypesServ: RelTypesService) {}

  /**
   * Найти записи с пагинацией
   */
  @Query(() => PaginatedRelTypesResponse, {
    description: "Получение списка типов связок",
  })
  async getRelTypes(
    @Args()
    args: RelTypesGet,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderRefTypesInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedRelTypesResponse | HttpException> {
    return this.relTypesServ.getRelTypes(args, pagination, order, searchField);
  }

  /**
   * Найти запись по id
   */
  @Query(() => RelTypesEntity, {
    description: 'Найти запись "типы связок" по id',
  })
  async getRelTypesById(
    @Args("id", { type: () => Int })
    id: number,
  ): Promise<RelTypesEntity | HttpException> {
    return this.relTypesServ.getRelTypesById(id);
  }

  /**
   * Создать запись
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => RelTypesEntity, {
    description: 'Создание записи "типы связок"',
  })
  async createRelTypes(
    @Args()
    args: RelTypesCreate,
  ): Promise<RelTypesEntity | HttpException> {
    return this.relTypesServ.createRelTypes(args);
  }

  /**
   * Редактировать запись
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => RelTypesEntity, {
    description: 'Редактирование записи "типы связок"',
  })
  async updateRelTypes(
    @Args("id", { type: () => Int })
    id: number,
    @Args()
    args: RelTypesUpdate,
  ): Promise<RelTypesEntity | HttpException> {
    return this.relTypesServ.updateRelTypes(id, args);
  }

  /**
   * Пометить запись как удаленную (а не удалить)
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => RelTypesEntity, {
    description: 'Удаление записи "типы связок"',
  })
  async deleteRelTypes(
    @Args("id", { type: () => Int })
    id: number,
  ): Promise<RelTypesEntity | HttpException> {
    return this.relTypesServ.deleteRelTypes(id);
  }
}
