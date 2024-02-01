import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DocStatusResolver } from "./docStatus.resolver";
import { DocStatusService } from "./docStatus.service";

/**
 * Модуль для работы со статусами документов
 */
@Module({
  imports: [TenancyModule],
  providers: [DocStatusResolver, DocStatusService],
})
export class DocStatusModule {}
