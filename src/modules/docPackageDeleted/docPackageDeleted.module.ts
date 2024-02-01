import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DocPackageDeletedResolver } from "./docPackageDeleted.resolver";
import { DocPackageDeletedService } from "./docPackageDeleted.service";

@Module({
  imports: [TenancyModule],
  providers: [DocPackageDeletedResolver, DocPackageDeletedService],
})
export class DocPackageDeletedModule {}
