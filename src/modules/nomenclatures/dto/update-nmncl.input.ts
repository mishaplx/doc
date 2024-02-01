import { ArgsType, Field, InputType, Int, OmitType, PartialType } from "@nestjs/graphql";

import { ElementNmnclInput } from "./element-nmncl.input";

@ArgsType()
@InputType()
export class UpdateNmnclInput extends PartialType(
  OmitType(ElementNmnclInput, ["parent_id"] as const),
) {
  @Field(() => Int)
  id: number;
}
