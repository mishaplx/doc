import { PickType } from "@nestjs/graphql";
import { TypeOrgEntity } from "../../../../entity/#organization/typeorg/typeorg.entity";

class TypeOrgSeed extends PickType(TypeOrgEntity, ["id", "nm", "del"] as const) {}

export const TypeorgArr: TypeOrgSeed[] = [
  {
    id: 1,
    nm: "typeorg",
    del: false,
  },
];
