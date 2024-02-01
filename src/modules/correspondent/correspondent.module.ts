import { Module } from "@nestjs/common";
import { CorrespondentResolver } from "./correspondent.resolver";
import { CorrespondentService } from "./correspondent.service";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";

/**
 * Модуль для работы с корреспондентами
 */
@Module({
  imports: [TenancyModule],
  providers: [CorrespondentResolver, CorrespondentService],
})
export class CorrespondentModule {}
