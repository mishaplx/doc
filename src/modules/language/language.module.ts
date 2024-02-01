import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { LanguageResolver } from "./language.resolver";
import { LanguageService } from "./language.service";

@Module({
  imports: [TenancyModule],
  providers: [LanguageResolver, LanguageService],
})
export class LanguagesModule {}
