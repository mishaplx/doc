import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { ACtStatusResolver } from "./actStatus.resolver";
import { ActStatusService } from "./actStatus.service";

@Module({
  imports: [TenancyModule],
  providers: [ACtStatusResolver, ActStatusService],
})
export class ActStatusModule {}
