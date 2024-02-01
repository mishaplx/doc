import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JWTGuardForFile } from "../../../auth/guard/file.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { FileUpdateService } from "./fileUpdate.service";

@Controller("update")
@UseGuards(JWTGuardForFile, PoliceGuard)
export class FileUpdateController {
  constructor(private readonly updateServ: FileUpdateService) {}

  // // Обновление файла
  // @Post("file")
  // @UseInterceptors(FilesInterceptor("files"))
  // async updateFile(
  //   @UploadedFiles() files: Array<Express.Multer.File>,
  //   @Body() body: { idFileItem: number },
  // ): Promise<any> {
  //   return await this.updateServ.updateFile(files, body.idFileItem);
  // }
}
