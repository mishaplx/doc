import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { InventoryEntity } from "../../entity/#organization/inventory/inventory.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetInventoryArgs } from "./dto/get-inventory.args";
import { OrderInventoryInput } from "./dto/order-inventory-request.dto";
import { PaginatedInventoryResponse } from "./dto/paginated-inventory-response.dto";
import { UpdateInventoryInput } from "./dto/update-inventory.input";
import { InventoryService } from "./inventory.service";

@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => InventoryEntity)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Query(() => PaginatedInventoryResponse, {
    description: 'Получение справочника "Описи"',
  })
  getAllInventory(
    @Args() args: GetInventoryArgs,
    @Args("pagination", {
      description: "Пагинация.",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderInventoryInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedInventoryResponse> {
    return this.inventoryService.findAll(args, pagination, order, searchField);
  }

  @Query(() => InventoryEntity, {
    nullable: true,
    description: "Получение определённой описи",
  })
  async getInventoryById(@Args("id", { type: () => Int }) id: number): Promise<InventoryEntity> {
    return await this.inventoryService.findById(id);
  }

  @Mutation(() => Int, { description: "Создание описи" })
  async createInventory(@Token() token: IToken): Promise<number> {
    return this.inventoryService.create(token.current_emp_id);
  }

  @Mutation(() => InventoryEntity, { description: "Редактирование описи" })
  updateInventory(
    @Args("updateInventoryInput") updateInventoryInput: UpdateInventoryInput,
    @Token() token: IToken,
  ): Promise<InventoryEntity> {
    return this.inventoryService.update(updateInventoryInput.id, updateInventoryInput, token);
  }

  @Mutation(() => Boolean, { description: "Удалить опись" })
  deleteInventory(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.inventoryService.delete(id);
  }

  @Mutation(() => Boolean, { description: "Подписать опись" })
  signInventory(
    @Args("id", { type: () => Int, description: "Id описи" }) id: number,
    @Args("sign", { type: () => String, description: "ЭЦП в PEM-формате" }) sign: string,
    @Token() token: IToken,
  ): Promise<boolean> {
    return this.inventoryService.signInventory(id, sign, token.current_emp_id);
  }
}
