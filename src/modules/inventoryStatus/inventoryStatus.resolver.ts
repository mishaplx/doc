import { UseGuards } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { InventoryStatusEntity } from "../../entity/#organization/inventoryStatus/inventoryStatus.entity";
import { InventoryStatusService } from "./inventoryStatus.service";

@UseGuards(DeactivateGuard)
@Resolver(() => InventoryStatusEntity)
export class InventoryStatusResolver {
  constructor(private readonly inventoryStatusService: InventoryStatusService) {}

  // @UseGuards(PoliceGuard)
  @Query(() => [InventoryStatusEntity], {
    description: 'Получение справочника "Статусы описи"',
  })
  getAllInventoryStatuses(): Promise<InventoryStatusEntity[]> {
    return this.inventoryStatusService.findAll();
  }
}
