import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { InventoryNameEntity } from "../../entity/#organization/inventoryName/inventoryName.entity";
import { InventoryNameService } from "./inventoryName.service";

@UseGuards(DeactivateGuard)
@Resolver(() => InventoryNameEntity)
export class InventoryNameResolver {
  constructor(private readonly inventoryNameService: InventoryNameService) {}

  @Query(() => [InventoryNameEntity], {
    description: 'Получение справочника "Наименование описи"',
  })
  getAllInventoryName(): Promise<InventoryNameEntity[]> {
    return this.inventoryNameService.findAll();
  }
}
