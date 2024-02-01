import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { CdocResolver } from "./cdoc.resolver";
import { CdocService } from "./cdoc.service";

@Module({
  imports: [TenancyModule],
  providers: [CdocResolver, CdocService],
})
export class CdocModule {}
