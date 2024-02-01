import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { CitizenResolver } from "./citizen.resolver";
import { CitizenService } from "./citizen.service";

@Module({
  imports: [TenancyModule],
  providers: [CitizenService, CitizenResolver],
})
export class CitizenModule {}
