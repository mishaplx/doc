import { PickType } from "@nestjs/graphql";
import { FORWARDING_VIEW } from "../../../../common/enum/enum";
import { Forwarding_viewEntity } from "../../../../entity/#organization/forwarding_view/forwarding_view.entity";

class Forwarding_viewSeed extends PickType(Forwarding_viewEntity, ["id", "del", "nm"] as const) {}

export const Forwarding_viewArr: Forwarding_viewSeed[] = [
  {
    id: FORWARDING_VIEW.VEIW.id,
    del: false,
    nm: FORWARDING_VIEW.VEIW.name,
  },
  {
    id: FORWARDING_VIEW.NOT_VEIW.id,
    del: false,
    nm: FORWARDING_VIEW.NOT_VEIW.name,
  },
];
