import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateTermInput } from "./create-term.input";

@InputType()
export class UpdateTermInput extends PartialType(CreateTermInput) {
  @Field(() => Int, { description: "Id срока хранения" })
  id!: number;
}
