import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBody, ApiOperation } from "@nestjs/swagger";
import { Token } from "../../auth/decorator/token.decorator";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { AuditService } from "./audit.service";
import { DownloadFileDto } from "./dto/downloadFile.dto";

@UseGuards(PoliceGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get("hash")
  async checkHash(@Res() res): Promise<any> {
    res.status(200).json(await this.auditService.checkHash());
  }

  @Post("download/file")
  @ApiOperation({ summary: "скачать файл с данными из таблицы аудит" })
  @ApiBody({ type: DownloadFileDto })
  async downloadFileAudit(
    @Body() body: { date_start: string; date_end: string; get_date: boolean },
    @Res() res,
    @Token() token: IToken,
  ): Promise<any> {
    if (body.get_date) {
      res.status(200).json(await this.auditService.getLastDate());
    } else {
      await this.auditService.getFileAudit(body.date_start, body.date_end, token, res);
    }
  }
}
