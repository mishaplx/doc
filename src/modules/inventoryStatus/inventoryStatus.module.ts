import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { InventoryStatusResolver } from "./inventoryStatus.resolver";
import { InventoryStatusService } from "./inventoryStatus.service";

@Module({
  imports: [TenancyModule],
  providers: [InventoryStatusResolver, InventoryStatusService],
})
export class InventoryStatusModule {}
