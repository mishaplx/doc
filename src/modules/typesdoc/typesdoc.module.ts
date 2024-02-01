import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { TypesDocResolver } from "./typesdoc.resolver";
import { TypesDocService } from "./typesdoc.service";

/**
 * Модуль для работы с типами документов
 */
@Module({
  imports: [TenancyModule],
  providers: [TypesDocResolver, TypesDocService],
})
export class TypesDocModule {}
