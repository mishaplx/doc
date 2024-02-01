import { PickType } from "@nestjs/graphql";
import { FORWARDING_STATUS } from "../../../../common/enum/enum";
import { Forwarding_statusEntity } from "../../../../entity/#organization/forwarding_status/forwarding_status.entity";

class Forwarding_statusSeed extends PickType(Forwarding_statusEntity, [
  "id",
  "del",
  "nm",
] as const) {}

export const Forwarding_StatusArr: Forwarding_statusSeed[] = [
  {
    id: FORWARDING_STATUS.STATUS_VEIW.id,
    del: false,
    nm: FORWARDING_STATUS.STATUS_VEIW.name,
  },
  {
    id: FORWARDING_STATUS.STATUS_NOT_VEIW.id,
    del: false,
    nm: FORWARDING_STATUS.STATUS_NOT_VEIW.name,
  },
];
