import {
  ArgsType,
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  PartialType,
  PickType,
} from "@nestjs/graphql";
import { ReportTemplateEntity } from "../../../../entity/#organization/report/reportTemplate.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedReportTemplateResponse extends PaginatedResponse(ReportTemplateEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "Тип шаблона отчета: id" })
  report_template_type_id: number;

  @Field(() => String, { description: "Название шаблона отчета" })
  name: string;

  @Field(() => String, { description: "Путь к папке с шаблоном" })
  path: string;

  @Field(() => String, { description: "Описание" })
  description: string;
}

/**
 * LIST
 */
@ArgsType()
export class ReportTemplateDtoList extends IntersectionType(
  PartialType(Base),
  PartialType(IdsDto),
) {}

/**
 * GET
 */
@ArgsType()
export class ReportTemplateDtoGet extends PickType(Base, ["id"] as const) {}
