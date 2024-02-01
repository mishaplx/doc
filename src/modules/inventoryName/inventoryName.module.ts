import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { InventoryNameResolver } from "./inventoryName.resolver";
import { InventoryNameService } from "./inventoryName.service";

@Module({
  imports: [TenancyModule],
  providers: [InventoryNameResolver, InventoryNameService],
})
export class InventoryNameModule {}
