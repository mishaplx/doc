import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import { FilesInterceptor } from "@nestjs/platform-express";
import { plainToClass } from "class-transformer";
import { Token } from "../../../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../../auth/guard/file.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { reportWordFreeDto } from "./reportWordFree.dto";
import { ReportWordFreeService } from "./reportWordFree.service";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportWordFreeController {
  constructor(private readonly reportWordFreeService: ReportWordFreeService) {}

  /********************************************
   * СОЗДАТЬ ФАЙЛ ИЗ ЗАГРУЖАЕМОГО ШАБЛОНА
   ********************************************/
  @Post("free/demo")
  @UseInterceptors(FilesInterceptor("files"))
  async reportFreeDemo(
    @Token()
    token: IToken,

    @UploadedFiles()
    files: Array<Express.Multer.File>,

    @Body()
    body: any,

    @Res()
    res,
  ): Promise<any> {
    body = plainToClass(reportWordFreeDto, body, {});
    return await this.reportWordFreeService.reportFreeDemo({
      files: files,
      emp_id: token.current_emp_id,
      body: body,
      res: res,
    });
  }
}
