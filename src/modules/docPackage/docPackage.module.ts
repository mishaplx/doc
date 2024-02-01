import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { DocPackageResolver } from "./docPackage.resolver";
import { DocPackageService } from "./docPackage.service";

@Module({
  imports: [TenancyModule],
  providers: [DocPackageResolver, DocPackageService],
})
export class DocPackageModule {}
