import { Module } from "@nestjs/common";

import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { KdocResolver } from "./kdoc.resolver";
import { KdocService } from "./kdoc.service";

@Module({
  imports: [TenancyModule],
  providers: [KdocResolver, KdocService],
})
export class KdocModule {}
