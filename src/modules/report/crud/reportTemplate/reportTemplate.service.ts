import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource, ILike, In, Repository } from "typeorm";

import { setErrorGQL } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { ReportTemplateEntity } from "../../../../entity/#organization/report/reportTemplate.entity";
import { listPaginationData } from "../../../../pagination/pagination.service";
import { PaginationInput } from "../../../../pagination/paginationDTO";
import {
  PaginatedReportTemplateResponse,
  ReportTemplateDtoGet,
  ReportTemplateDtoList,
} from "./reportTemplate.dto";

const ERR = "Шаблоны отчетов: ошибка ";

@Injectable()
export class ReportTemplateService {
  private readonly dataSource: DataSource;
  private readonly reportTemplateRepository: Repository<ReportTemplateEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.reportTemplateRepository = dataSource.getRepository(ReportTemplateEntity);
  }

  /**
   * LIST
   */
  async listReportTemplate(
    args: ReportTemplateDtoList,
    pagination?: PaginationInput,
  ): Promise<PaginatedReportTemplateResponse | HttpException> {
    try {
      const where = {
        id: args?.id ?? (args.ids ? In(args.ids) : undefined),
        report_template_type_id: args?.report_template_type_id,
        name: args?.name ? ILike(`%${args.name}%`) : undefined,
        path: args?.name ? ILike(`%${args.path}%`) : undefined,
        description: args?.name ? ILike(`%${args.description}%`) : undefined,
      };
      const order = {
        name: "ASC",
      };
      return await listPaginationData({
        repository: this.reportTemplateRepository,
        relations: { Reports: true },
        where: where,
        pagination: pagination,
        order: order,
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения списка", err);
    }
  }

  /**
   * GET
   */
  async getReportTemplate(
    args: ReportTemplateDtoGet,
  ): Promise<ReportTemplateEntity | HttpException> {
    try {
      return await this.reportTemplateRepository.findOneOrFail({
        relations: { Reports: true },
        where: { id: args.id },
        order: { name: "ASC" },
      });
    } catch (err) {
      return setErrorGQL(ERR + "чтения записи", err);
    }
  }
}
