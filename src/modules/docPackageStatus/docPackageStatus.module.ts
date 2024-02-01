import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DocPackageStatusResolver } from "./docPackageStatus.resolver";
import { DocPackageStatusService } from "./docPackageStatus.service";

@Module({
  imports: [TenancyModule],
  providers: [DocPackageStatusResolver, DocPackageStatusService],
})
export class DocPackageStatusModule {}
