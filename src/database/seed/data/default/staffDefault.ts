import { PickType } from "@nestjs/graphql";
import { StaffEntity } from "../../../../entity/#organization/staff/staff.entity";

class UnitSeed extends PickType(StaffEntity, [
  "id",
  "nm",
  "del",
  "temp",
  "ln",
  "mn",
  "eml",
  "dob",
  "phone",
  "user_id",
] as const) {}

export const staffDefaultArr: UnitSeed[] = [
  {
    id: 1,
    nm: "root",
    del: false,
    temp: false,
    ln: "root",
    mn: "root",
    eml: "root@gmail.com",
    dob: new Date(),
    phone: "777-77-77",
    user_id: 1,
  },
];
