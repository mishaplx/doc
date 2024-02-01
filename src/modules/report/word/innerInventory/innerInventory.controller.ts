import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";

import { Token } from "../../../../auth/decorator/token.decorator";
import { JWTGuardForFile } from "../../../../auth/guard/file.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ReportWordInnerInventoryService } from "./innerInventory.service";

@Controller("report")
@UseGuards(JWTGuardForFile)
export class ReportWordInnerInventoryController {
  constructor(private readonly reportWordInnerInventoryService: ReportWordInnerInventoryService) {}

  /********************************************
   * ПРОСМОТРЕТЬ ВНУТРЕННЮЮ ОПИСЬ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  @Post("inner-inventory")
  async reportJobStream(
    @Token() token: IToken,
    @Body()
    body: {
      id: number;
    },
    @Res() res,
  ): Promise<any> {
    return await this.reportWordInnerInventoryService.reportInnerInventoryStream({
      id: body.id,
      res: res,
      token,
    });
  }
}
