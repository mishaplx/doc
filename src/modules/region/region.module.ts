import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { RegionResolver } from "./region.resolver";
import { RegionService } from "./region.service";

@Module({
  imports: [TenancyModule],
  providers: [RegionService, RegionResolver],
})
export class RegionModule {}
