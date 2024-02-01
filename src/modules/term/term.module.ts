import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { TermResolver } from "./term.resolver";
import { TermService } from "./term.service";

@Module({
  imports: [TenancyModule],
  providers: [TermService, TermResolver],
})
export class TermModule {}
