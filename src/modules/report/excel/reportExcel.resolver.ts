import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { ReportExcelService } from "./reportExcel.service";

@Resolver()
@UseGuards(DeactivateGuard, PoliceGuard)
export class ReportExcelResolver {
  constructor(private reportExcelService: ReportExcelService) {}

  @Mutation(() => FileBlockEntity, {
    description: "Отчет Excel: создать",
  })
  async reportStatCreate(
    @Token()
    token: IToken,

    @Args("report_template_id", {
      type: () => Int,
      description: "Шаблон отчета: id",
    })
    report_template_id: number,

    @Args("pdf_only", {
      type: () => Boolean,
      description: "Признак: у отчета только один pdf файл",
    })
    pdf_only?: boolean,

    @Args("report_one", {
      type: () => Boolean,
      description: "Признак: для шаблона хранить только последний отчет",
    })
    report_one?: boolean,

    @Args("param", {
      type: () => GraphQLJSON,
      description: "Параметры отчета",
    })
    param?: JSON,
  ): Promise<FileBlockEntity | HttpException> {
    return await this.reportExcelService.create({
      token: token,
      report_template_id: report_template_id,
      pdf_only: pdf_only,
      report_one: report_one,
      param: param,
    });
  }
}
