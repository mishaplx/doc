import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DashboardResolver } from "./dashboard.resolver";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [TenancyModule],
  providers: [DashboardResolver, DashboardService],
})
export class DashboardModule {}
