import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FileTypesResolver } from "./file-types.resolver";
import { FileTypesService } from "./file-types.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [FileTypesResolver, FileTypesService],
  exports: [FileTypesService],
})
export class FileTypesModule {}
