import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { OrgResolver } from "./org.resolver";
import { OrgService } from "./org.service";

@Module({
  imports: [TenancyModule],
  providers: [OrgService, OrgResolver],
})
export class OrgModule {}
