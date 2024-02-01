import { PickType } from "@nestjs/graphql";
import { DocProject } from "../../../../../common/enum/enum";
import { ProjectStatusEntity } from "../../../../../entity/#organization/project/projectStatus.entity";

class ProjectStatusSeed extends PickType(ProjectStatusEntity, ["id", "del", "nm"] as const) {}

export const projectStatusArr: ProjectStatusSeed[] = [
  {
    id: DocProject.NEW,
    del: false,
    nm: "Новый",
  },
  {
    id: DocProject.IN_PROCESS,
    del: false,
    nm: "В работе",
  },
  {
    id: DocProject.REVISION,
    del: false,
    nm: "На доработке",
  },
  {
    id: DocProject.COMPLETED,
    del: false,
    nm: "Завершен",
  },
  {
    id: DocProject.CLOSED,
    del: false,
    nm: "Закрыт",
  },
];
