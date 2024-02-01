import { Body, Controller, Post, Res, Req, UseGuards } from "@nestjs/common";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "src/auth/decorator/token.decorator";
// import { Access } from "src/modules/access/guard/access.guard";
import { JWTGuardForFile } from "../../../auth/guard/file.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { FileDownloadService } from "./fileDownload.service";

@Controller("download")
// @Access(ActionsFile.FILE_DOWNLOAD)
@UseGuards(JWTGuardForFile, PoliceGuard)
export class FileDownloadController {
  constructor(private readonly downloadServ: FileDownloadService) {}

  @Post("file")
  async downloadFile(
    @Body()
    body: {
      idFileItem: number,
      blockFileBlock?: boolean;
    },
    @Token() token: IToken,
    @Res() res,
    @Req() req
  ): Promise<any> {
    return await this.downloadServ.downloadFile({
      token: token,
      idFileItem: body.idFileItem,
      blockFileBlock: body.blockFileBlock,
      res: res,
      req: req,
    });
  }

  @Post("ccs")
  async downloadCCS(@Res() res): Promise<any> {
    return await this.downloadServ.downloadCcs({
      res: res,
    });
  }

  @Post("tools")
  async downloadTools(@Res() res): Promise<any> {
    return await this.downloadServ.downloadTools({
      res: res,
    });
  }
}
