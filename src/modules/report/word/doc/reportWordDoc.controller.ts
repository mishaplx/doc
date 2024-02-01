import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "../../../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../../auth/guard/file.guard";
import { ReportWordDocService } from "./reportWordDoc.service";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportDocController {
  constructor(private readonly reportWordDocService: ReportWordDocService) {}

  /********************************************
   * ПРОСМОТРЕТЬ РКК КАРТОЧКУ ДОКУМЕНТА БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  @Post("doc")
  async reportDocStream(
    @Token() token: IToken,
    @Body()
    body: {
      doc_id: number;
      note?: string;
    },
    @Res() res,
  ): Promise<any> {
    return await this.reportWordDocService.reportDocStream({
      emp_id: token.current_emp_id,
      doc_id: body.doc_id,
      res: res,
    });
  }
}
