import { ArgsType, Field, Int, PartialType } from "@nestjs/graphql";
import { RelTypesCreate } from "./relTypes.create.dto";

@ArgsType()
export class RelTypesUpdate extends PartialType(RelTypesCreate) {
  @Field({ nullable: true, description: "Признак удаления" })
  del?: boolean;
}
