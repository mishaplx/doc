import { Module } from "@nestjs/common";
import { TenancyModule } from "../../../database/datasource/tenancy/tenancy.module";
import { JobStatusResolver } from "./jobStatus.resolver";
import { JobStatusService } from "./jobStatus.service";

@Module({
  imports: [TenancyModule],
  providers: [JobStatusResolver, JobStatusService],
})
export class JobStatusModule {}
