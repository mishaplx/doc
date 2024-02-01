import { PickType } from "@nestjs/graphql";
import "dotenv/config";
import { OrgEntity } from "../../../../entity/#organization/org/org.entity";

class OrgSeed extends PickType(OrgEntity, ["id", "temp", "del", "nm", "region"] as const) {}

export const OrgDefaultArr: OrgSeed[] = [
  {
    id: 1,
    del: false,
    temp: false,
    nm: process.env.DB_DATABASE_ORG, // FIXME
    region: 1,
  },
];
