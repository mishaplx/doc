import { PickType } from "@nestjs/graphql";
import { PrivEntity } from "../../../../../entity/#organization/priv/priv.entity";

class PrivSeed extends PickType(PrivEntity, ["id", "temp", "del", "nm"] as const) {}

export const privArr: PrivSeed[] = [
  {
    nm: "Совершенно секретно",
    del: false,
    temp: false,
    id: 1,
  },
  {
    nm: "ДСП",
    del: false,
    temp: false,
    id: 2,
  },
  {
    nm: "Общий",
    del: false,
    temp: false,
    id: 3,
  },
  {
    nm: "Ограниченное распространение",
    del: false,
    temp: false,
    id: 4,
  },
];
