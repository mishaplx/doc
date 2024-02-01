import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { ProjectStatusResolver } from "./projectStatus.resolver";
import { ProjectStatusService } from "./projectStatus.service";

@Module({
  imports: [TenancyModule],
  providers: [ProjectStatusResolver, ProjectStatusService],
})
export class ProjectStatusModule {}
