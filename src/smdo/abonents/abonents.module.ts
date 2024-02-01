import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { AbonentsResolver } from "./abonents.resolver";
import { AbonentsService } from "./abonents.service";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  providers: [AbonentsResolver, AbonentsService],
  exports: [AbonentsService],
})
export class AbonentsModule {}
