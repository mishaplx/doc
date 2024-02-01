import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FavoritesModule } from "../favorites/favorites.module";
import { FavoritesService } from "../favorites/favorites.service";
import Logger from "../logger/logger";
import { NotifyModule } from "../notify/notify.module";
import { NumModule } from "../num/num.module";
import { ReportModule } from "../report/report.module";
import { DocController } from "./doc.controller";
import { DocResolver } from "./doc.resolver";
import { DocService } from "./doc.service";
import { DocIncomeService } from "./doc_income.service";
import { DocInnerService } from "./doc_inner.service";
import { DocOutcomeService } from "./doc_outcome.service";
import { ForwardingResolver } from "./forwarding/forwarding.resolver";
import { ForwardingService } from "./forwarding/forwarding.service";

/**
 * Модуль для работы с документами
 */
@Module({
  imports: [TenancyModule, ReportModule, NumModule, NotifyModule, FavoritesModule],
  controllers: [DocController],
  providers: [
    DocResolver,
    DocService,
    Logger,
    ForwardingResolver,
    FavoritesService,
    ForwardingService,
    DocIncomeService,
    DocOutcomeService,
    DocInnerService,
  ],
})
export class DocModule {}
