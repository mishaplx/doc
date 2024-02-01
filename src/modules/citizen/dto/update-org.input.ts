import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { createCitizenInput } from "./create-org.input";

@InputType()
export class updateCitizenInput extends PartialType(createCitizenInput) {
  @Field(() => Int)
  id!: number;
}
