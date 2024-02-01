import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { TemplateContentResolver } from "./templateContent.resolver";
import { TemplateContentService } from "./templateContent.service";

@Module({
  imports: [TenancyModule],
  providers: [TemplateContentService, TemplateContentResolver],
})
export class TemplateContentModule {}
