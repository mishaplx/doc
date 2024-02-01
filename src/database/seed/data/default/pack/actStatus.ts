import { PickType } from "@nestjs/graphql";
import { ActStatus } from "../../../../../common/enum/enum";
import { ActStatusEntity } from "../../../../../entity/#organization/actStatus/actStatus.entity";

class ActStatusSeed extends PickType(ActStatusEntity, ["id", "del", "nm"] as const) {}

export const actStatusArr: ActStatusSeed[] = [
  {
    id: ActStatus.NEW,
    del: false,
    nm: "Новый",
  },
  {
    id: ActStatus.SIGN,
    del: false,
    nm: "Подписан",
  },
  {
    id: ActStatus.DOC_PACKAGE_DELETED,
    del: false,
    nm: "Дела удалены",
  },
];
