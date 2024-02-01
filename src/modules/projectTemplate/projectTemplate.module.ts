import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FileUploadService } from "../file/fileUpload/fileUpload.service";
import { ProjectTemplateController } from "./projectTemplate.controller";
import { ProjectTemplateResolver } from "./projectTemplate.resolver";
import { ProjectTemplateService } from "./projectTemplate.service";
import Logger from "../logger/logger";

// Справочник типов документов в СМДО
@Module({
  imports: [TenancyModule],
  controllers: [ProjectTemplateController],
  providers: [ProjectTemplateResolver, ProjectTemplateService, FileUploadService, Logger],
  exports: [ProjectTemplateService],
})
export class ProjectTemplateModule {}
