import { PickType } from "@nestjs/graphql";
import { RegionEntity } from "../../../../entity/#organization/region/region.entity";

class RegionSeed extends PickType(RegionEntity, ["id", "del", "temp", "nm"] as const) {}

export const regionArr: RegionSeed[] = [
  {
    id: 1,
    del: false,
    temp: false,
    nm: "region",
  },
];
