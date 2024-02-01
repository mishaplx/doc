import { PickType } from "@nestjs/graphql";
import { EmpEntity } from "../../../../entity/#organization/emp/emp.entity";

class EmpSeed extends PickType(EmpEntity, [
  "id",
  "del",
  "temp",
  "isaut",
  "isexec",
  "issign",
  "org",
  "post_id",
  "unit_id",
  "user_id",
  "is_admin",
] as const) {}

export const empDefaultArr: EmpSeed[] = [
  {
    id: 1,
    del: false,
    temp: false,
    isaut: false,
    isexec: false,
    issign: false,
    org: 1,
    post_id: 1,
    unit_id: 1,
    user_id: 1,
    is_admin: true,
  },
];
