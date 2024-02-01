import { PickType } from "@nestjs/graphql";
import { ReportTemplateTypeEntity } from "../../../../../entity/#organization/report/reportTemplateType.entity";

class ReportTemplateTypeSeed extends PickType(ReportTemplateTypeEntity, [
  "id",
  "del",
  "name",
] as const) {}

export const reportTemplateTypeArr: ReportTemplateTypeSeed[] = [
  {
    id: 1,
    del: false,
    name: "xlsx_stat",
  },
  {
    id: 2,
    del: false,
    name: "docx_doc",
  },
  {
    id: 3,
    del: false,
    name: "docx_job",
  },
];
