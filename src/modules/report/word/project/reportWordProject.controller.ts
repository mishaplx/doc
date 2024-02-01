import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "../../../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../../auth/guard/file.guard";
import { ReportWordProjectService } from "./reportWordProject.service";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportWordProjectController {
  constructor(private readonly reportWordProjectService: ReportWordProjectService) {}

  /********************************************
   * ПРОСМОТРЕТЬ ОТЧЕТ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  @Post("project")
  async reportJobStream(
    @Token() token: IToken,
    @Body()
    body: {
      project_id: number;
    },
    @Res() res,
  ): Promise<any> {
    return await this.reportWordProjectService.reportStream({
      emp_id: token.current_emp_id,
      project_id: body.project_id,
      res: res,
    });
  }
}
