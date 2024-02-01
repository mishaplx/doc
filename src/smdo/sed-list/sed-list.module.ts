import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { SedListResolver } from "./sed-list.resolver";
import { SedListService } from "./sed-list.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [SedListResolver, SedListService],
  exports: [SedListService],
})
export class SedListModule {}
