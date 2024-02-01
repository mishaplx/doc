import { Module } from "@nestjs/common";

import { TenancyModule } from "../database/datasource/tenancy/tenancy.module";
import { SmdoController } from "./smdo.controller";
import { SmdoService } from "./smdo.service";

// модуль СМДО
@Module({
  imports: [TenancyModule],
  providers: [SmdoService],
  controllers: [SmdoController],
  exports: [SmdoService],
})
export class SmdoModule {}
