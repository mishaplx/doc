import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { NomenclaturesResolver } from "./nomenclatures.resolver";
import { NomenclaturesService } from "./nomenclatures.service";

@Module({
  imports: [TenancyModule],
  providers: [NomenclaturesResolver, NomenclaturesService],
})
export class NomenclaturesModule {}
