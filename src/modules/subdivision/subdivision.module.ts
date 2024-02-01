import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { SubdivisionResolver } from "./subdivision.resolver";
import { SubdivisionService } from "./subdivision.service";

// Подразделение
@Module({
  imports: [TenancyModule],
  providers: [SubdivisionResolver, SubdivisionService],
})
export class SubdivisionModule {}
