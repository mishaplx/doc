import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { plainToClass } from "class-transformer";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "src/auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../auth/guard/file.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { fileCreateDto } from "../fileCreate/fileCreate.dto";
import { FileUploadService } from "./fileUpload.service";

@UseGuards(JWTGuardForFile, PoliceGuard)
@Controller("upload")
export class FileUploadController {
  constructor(private readonly uploadService: FileUploadService) {}

  /** загрузить файл */
  @Post("file")
  @UseInterceptors(FilesInterceptor("files"))
  // @ApiParam({
  //   name: 'files',
  //   required: true,
  //   description: 'загружаемые файлы',
  //   schema: {
  //     type: 'array',
  //     items: {
  //       type: 'string',
  //       format: 'binary',
  //     }
  //     // type: 'object',
  //     // properties: {
  //     //   filename: {
  //     //     type: 'array',
  //     //     items: {
  //     //       type: 'string',
  //     //       format: 'binary',
  //     //     }
  //     //   }
  //     // }
  //   }
  // })
  async uploadFile(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>, // @UploadedFile() file,
    @Token() token: IToken,
    @Res() res,
    @Req() req,
  ): Promise<any> {
    // преобразовать типы
    // body = plainToClass(fileCreateDto, body, { enableImplicitConversion: true });
    body = plainToClass(fileCreateDto, body, {});
    return await this.uploadService.uploadFile({
      files: files,
      param: body,
      token: token,
      res: res,
      req: req
    });
  }
}
