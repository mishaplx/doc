import { PickType } from "@nestjs/graphql";
import { ReportTemplateEntity } from "../../../../../entity/#organization/report/reportTemplate.entity";

class ReportTemplateSeed extends PickType(ReportTemplateEntity, [
  "id",
  "report_template_type_id",
  "name",
  "path",
  "description",
] as const) {}

export const reportTemplateArr: ReportTemplateSeed[] = [
  {
    id: 1,
    report_template_type_id: 1,
    name: "Снижение премий",
    path: "excel/001 - perfoming/",
    description: "Расчет процента снижения премии в зависимости от качества выполненных поручений",
  },
  {
    id: 2,
    report_template_type_id: 1,
    name: "Неисполненные поручения",
    path: "excel/002 - job control/",
    description: "Перечень неисполненных поручений по делам",
  },
  {
    id: 3,
    report_template_type_id: 1,
    name: "Об исполнительской дисциплине (исполнители)",
    path: "excel/003 - discipline_exec",
    description: "Статистика исполняемости поручений (по исполнителям)",
  },
  {
    id: 4,
    report_template_type_id: 1,
    name: "Об исполнительской дисциплине (контролеры)",
    path: "excel/004 - discipline_control",
    description: "Статистика исполняемости поручений (по контролерам)",
  },
];
