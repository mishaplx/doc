import { Module } from "@nestjs/common";

import { TenancyModule } from "../database/datasource/tenancy/tenancy.module";
import { ActiveService } from "./active.service";
import { AdminResolver } from "./admin.resolver";
import { AdminService } from "./admin.service";

@Module({
  imports: [TenancyModule],
  providers: [AdminResolver, AdminService, ActiveService],
})
export class AdminModule {}
