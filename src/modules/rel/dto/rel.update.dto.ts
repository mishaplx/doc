import { ArgsType, Field, PartialType } from "@nestjs/graphql";
import { RelCreate } from "./rel.create.dto";

@ArgsType()
export class RelUpdate extends PartialType(RelCreate) {
  @Field({ nullable: true, description: "Признак удаления" })
  del: boolean;
}
