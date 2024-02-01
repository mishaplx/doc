import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { StaffResolver } from "./staff.resolver";
import { StaffService } from "./staff.service";

@Module({
  imports: [TenancyModule],
  providers: [StaffService, StaffResolver],
})
export class StaffModule {}
