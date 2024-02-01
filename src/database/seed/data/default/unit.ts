import { PickType } from "@nestjs/graphql";
import { UnitEntity } from "../../../../entity/#organization/unit/unit.entity";

class UnitSeed extends PickType(UnitEntity, [
  "id",
  "temp",
  "del",
  "short_name",
  "nm",
  "code",
] as const) {}

export const unitDefaultArr: UnitSeed[] = [
  {
    id: 1,
    temp: false,
    del: false,
    short_name: "Тех. поддержка",
    nm: "Техническая поддержка",
    code: "1",
  },
];
