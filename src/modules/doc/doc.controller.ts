import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiBody, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { DocService } from "./doc.service";
import { bodyDownloadBookDTO } from "./dto/bodyDownloadBook.dto";

@Controller("api")
export class DocController {
  constructor(private docServ: DocService) {}

  @Post("download-book-document")
  @ApiOperation({ summary: "скачать файл с данными из таблицы документов" })
  @ApiBody({ type: bodyDownloadBookDTO })
  downloadBookDoc(
    @Body() body: bodyDownloadBookDTO,
    @Token() token: IToken,
    @Res() res: Response,
  ): Promise<void> {
    return this.docServ.downloadBookDoc(body, token, res);
  }
}
