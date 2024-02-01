import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { FileModule } from "../file/file.module";
import { ReportTemplateResolver } from "./crud/reportTemplate/reportTemplate.resolver";
import { ReportTemplateService } from "./crud/reportTemplate/reportTemplate.service";
import { ReportExcelController } from "./excel/reportExcel.controller";
import { ReportExcelResolver } from "./excel/reportExcel.resolver";
import { ReportExcelService } from "./excel/reportExcel.service";
import { ReportWordActController } from "./word/act/reportWordAct.controller";
import { ReportWordActService } from "./word/act/reportWordAct.service";
import { ReportDocController } from "./word/doc/reportWordDoc.controller";
import { ReportWordProjectController } from "./word/project/reportWordProject.controller";
import { ReportWordProjectService } from "./word/project/reportWordProject.service";
import { ReportWordDocResolver } from "./word/doc/reportWordDoc.resolver";
import { ReportWordDocService } from "./word/doc/reportWordDoc.service";
import { ReportWordFreeController } from "./word/free/reportWordFree.controller";
import { ReportWordFreeService } from "./word/free/reportWordFree.service";
import { ReportWordInnerInventoryController } from "./word/innerInventory/innerInventory.controller";
import { ReportWordInnerInventoryService } from "./word/innerInventory/innerInventory.service";
import { ReportWordJobController } from "./word/job/reportWordJob.controller";
import { ReportWordJobService } from "./word/job/reportWordJob.service";

@Module({
  imports: [TenancyModule, FileModule],
  controllers: [
    ReportDocController,
    ReportWordProjectController,
    ReportWordJobController,
    ReportWordActController,
    ReportWordInnerInventoryController,
    ReportWordFreeController,
    ReportExcelController,
  ],
  providers: [
    ReportTemplateResolver,
    ReportWordDocResolver,
    ReportExcelResolver,
    ReportTemplateService,
    ReportWordProjectService,
    ReportWordDocService,
    ReportWordJobService,
    ReportWordActService,
    ReportWordInnerInventoryService,
    ReportWordFreeService,
    ReportExcelService,
  ],
  exports: [ReportWordDocService],
})
export class ReportModule {}
