import { PickType } from "@nestjs/graphql";
import { ProjectActionEntity } from "../../../../../entity/#organization/project/ProjectAction.entity";
import { ProjectActionEnum } from "../../../../../modules/projects/projects.const";

class ProjectActionSeed extends PickType(ProjectActionEntity, [
  "id",
  "del",
  "name",
  "name_declination",
  "do_name",
] as const) {}

export const projectActionArr: ProjectActionSeed[] = [
  {
    id: ProjectActionEnum.VIS,
    del: false,
    name: "Визировать",
    name_declination: "Визирование",
    do_name: "Завизировано",
  },
  {
    id: ProjectActionEnum.SIGN,
    del: false,
    name: "Подписать",
    name_declination: "Подписание",
    do_name: "Подписано",
  },
  {
    id: ProjectActionEnum.APPROV,
    del: false,
    name: "Утвердить",
    name_declination: "Утверждение",
    do_name: "Утверждено",
  },
];
