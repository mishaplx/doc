import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { Token } from "../../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { FileBlockEntity } from "../../../../entity/#organization/file/fileBlock.entity";
import { ReportWordDocService } from "./reportWordDoc.service";

@Resolver()
@UseGuards(DeactivateGuard, PoliceGuard)
export class ReportWordDocResolver {
  constructor(private reportWordDocService: ReportWordDocService) {}

  @Mutation(() => FileBlockEntity, {
    description: "Word-карточка документа: создать",
  })
  async reportDocFile(
    @Token()
    token: IToken,

    @Args("doc_id", {
      type: () => Int,
      description: "Документ: id",
    })
    doc_id: number,
  ): Promise<FileBlockEntity | HttpException> {
    return await this.reportWordDocService.reportDocFile({
      token,
      doc_id: doc_id,
    });
  }
}
