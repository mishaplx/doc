import { PickType } from "@nestjs/graphql";
import { ProjectSubActionEntity } from "../../../../../entity/#organization/project/projectSubAction.entity";

class ProjectSubActionSeed extends PickType(ProjectSubActionEntity, [
  "id",
  "del",
  "name_sub_action",
  "full_name",
] as const) {}

export const projectSubActionArr: ProjectSubActionSeed[] = [
  {
    id: 1,
    del: false,
    name_sub_action: "На доработку",
    full_name: "Возможность вернуть проект на доработку с этапа",
  },
  {
    id: 2,
    del: false,
    name_sub_action: "Закрыть",
    full_name: "Возможность закрыть проект на этапе",
  },
  {
    id: 3,
    del: false,
    name_sub_action: "С замечаниями",
    full_name: "Возможность закрыть этап с замечанием",
  },
  {
    id: 4,
    del: true,
    name_sub_action: "С ЭЦП",
    full_name: "Возможность использовать ЭЦП на этапе",
  },
  {
    id: 5,
    del: false,
    name_sub_action: "Добавление",
    full_name: "Возможность добавить участника к этапу",
  },
];
