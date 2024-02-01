import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "../../../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../../auth/guard/file.guard";
import { ReportWordJobService } from "./reportWordJob.service";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportWordJobController {
  constructor(private readonly reportWordJobService: ReportWordJobService) {}

  /********************************************
   * ПРОСМОТРЕТЬ КАРТОЧКУ ПОРУЧЕНИЯ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  @Post("job")
  async reportJobStream(
    @Token() token: IToken,
    @Body()
    body: {
      job_id: number;
    },
    @Res() res,
  ): Promise<any> {
    return await this.reportWordJobService.reportJobStream({
      emp_id: token.current_emp_id,
      job_id: body.job_id,
      res: res,
    });
  }
}
