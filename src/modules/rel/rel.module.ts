import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { RelResolver } from "./rel.resolver";
import { RelService } from "./rel.service";

@Module({
  imports: [TenancyModule],
  providers: [RelService, RelResolver],
})
export class RelModule {}
