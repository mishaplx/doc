import { Controller, UseGuards } from "@nestjs/common";
import { JWTGuardForFile } from "../../../auth/guard/file.guard";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportExcelController {
  // constructor(
  //     private readonly reportService: ReportWordDocService,
  //     private readonly reportWordJobService: ReportWordJobService,
  // ) {}
  // /********************************************
  //  * СОЗДАТЬ ОТЧЕТ СТАТИЧЕСКИЙ
  //  ********************************************/
  // @Post('stat')
  // async reportStatCreate(
  //   @Token() token: IToken,
  //   @Body() body: IReportDocBody,
  //   @Res() res,
  // ): Promise<any> {
  //   return await this.reportExcelService.create({
  //     token: token,
  //     body: body,
  //     res: res,
  //   });
  // }
}
