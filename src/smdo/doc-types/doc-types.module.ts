import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DockTypesResolver } from "./dock-types.resolver";
import { DockTypesService } from "./dock-types.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [DockTypesResolver, DockTypesService],
  exports: [DockTypesService],
})
export class DocTypesModule {}
