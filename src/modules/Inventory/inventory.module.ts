import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { InventoryResolver } from "./inventory.resolver";
import { InventoryService } from "./inventory.service";

@Module({
  imports: [TenancyModule],
  providers: [InventoryResolver, InventoryService],
})
export class InventoryModule {}
