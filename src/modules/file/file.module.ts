import { Module } from "@nestjs/common";
import { TenancyModule } from "../../database/datasource/tenancy/tenancy.module";
import { NotifyModule } from "../notify/notify.module";
import { FileCronMainContentService } from "./cron/file.cron.mainContent.service";
import { FileCronPdfCreateService } from "./cron/file.cron.pdfCreate.service";
import { FileCronPdfFormatService } from "./cron/file.cron.pdfFormat.service";
import { FileResolver } from "./file.resolver";
import { FileService } from "./file.service";
import { FileCreateService } from "./fileCreate/fileCreate.service";
import { FileDeleteResolver } from "./fileDelete/fileDelete.resolver";
import { FileDeleteService } from "./fileDelete/fileDelete.service";
import { FileDownloadController } from "./fileDownload/fileDownload.controller";
import { FileDownloadResolver } from "./fileDownload/fileDownload.resolver";
import { FileDownloadService } from "./fileDownload/fileDownload.service";
import { FileListResolver } from "./fileList/fileList.resolver";
import { FileListService } from "./fileList/fileList.service";
import { FileUpdateResolver } from "./fileUpdate/fileUpdate.resolver";
import { FileUpdateService } from "./fileUpdate/fileUpdate.service";
import { FileUploadController } from "./fileUpload/fileUpload.controller";
import { FileUploadService } from "./fileUpload/fileUpload.service";
import { FileUpdateController } from "./fileUpdate/fileUpdate.controller";
import { AuthModule } from "src/auth/auth.module";
import { FileCronSysService } from "./cron/file.cron.sys.service";
import Logger from "../logger/logger";

@Module({
  imports: [TenancyModule, NotifyModule, AuthModule],
  controllers: [FileUploadController, FileDownloadController, FileUpdateController],
  providers: [
    Logger,
    FileResolver,
    FileService,
    FileCreateService,
    FileUpdateResolver,
    FileUpdateService,
    FileDeleteResolver,
    FileDeleteService,
    FileListResolver,
    FileListService,
    FileUploadService,
    FileDownloadService,
    FileDownloadResolver,
    FileCronMainContentService,
    FileCronPdfFormatService,
    FileCronPdfCreateService,
    FileCronSysService,
  ],
  exports: [
    FileService,
    FileCreateService,
    FileUpdateService,
    FileDeleteService,
    FileUploadService,
    FileDownloadService,
  ],
})
export class FileModule {}
