import { ObjectType, PickType } from "@nestjs/graphql";
import { ActEntity } from "../../../entity/#organization/act/act.entity";

@ObjectType()
export class ActResponse extends PickType(ActEntity, [
  "id",
  "number",
  "dtc",
  "basis",
  "count_doc_package",
  "count_doc",
  "count_file",
  "status_id",
  "Status",
  "FileBlock",
] as const) {}
