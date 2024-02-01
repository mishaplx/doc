import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";

import { Token } from "../../../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../../auth/guard/file.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ReportWordActService } from "./reportWordAct.service";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportWordActController {
  constructor(private readonly reportWordActService: ReportWordActService) {}

  /********************************************
   * ПРОСМОТРЕТЬ АКТ УНИЧТОЖЕНИЯ ДЕЛ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  @Post("act/del")
  async reportJobStream(
    @Token() token: IToken,
    @Body()
    body: {
      act_id: number;
    },
    @Res() res,
  ): Promise<any> {
    return await this.reportWordActService.reportActDelStream({
      emp_id: token.current_emp_id,
      act_id: body.act_id,
      res: res,
    });
  }
}
