import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { ReportTemplateEntity } from "../../../../entity/#organization/report/reportTemplate.entity";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedReportTemplateResponse,
  ReportTemplateDtoGet,
  ReportTemplateDtoList,
} from "./reportTemplate.dto";
import { ReportTemplateService } from "./reportTemplate.service";

const DESC = "Шаблоны отчетов: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class ReportTemplateResolver {
  constructor(private reportTemplateServ: ReportTemplateService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedReportTemplateResponse, {
    description: DESC + "получить список",
  })
  async listReportTemplate(
    @Args() args: ReportTemplateDtoList,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
  ): Promise<PaginatedReportTemplateResponse | HttpException> {
    return this.reportTemplateServ.listReportTemplate(args, pagination);
  }

  /**
   * GET
   */
  @Query(() => ReportTemplateEntity, {
    description: DESC + "получить запись",
  })
  async getReportTemplate(
    @Args() args: ReportTemplateDtoGet,
  ): Promise<ReportTemplateEntity | HttpException> {
    return this.reportTemplateServ.getReportTemplate(args);
  }
}
