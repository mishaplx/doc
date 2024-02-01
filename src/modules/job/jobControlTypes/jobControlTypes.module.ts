import { Module } from "@nestjs/common";
import { TenancyModule } from "../../../database/datasource/tenancy/tenancy.module";
import { JobsControlTypesResolver } from "./jobControlTypes.resolver";
import { JobsControlTypesService } from "./jobControlTypes.service";

/**
 * Модуль для работы с типами контроля поручений
 */
@Module({
  imports: [TenancyModule],
  providers: [JobsControlTypesResolver, JobsControlTypesService],
})
export class JobsControlTypesModule {}
