import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { PackagesResolver } from "./packages.resolver";
import { PackagesService } from "./packages.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [PackagesResolver, PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
