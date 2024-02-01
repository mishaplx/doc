import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsPositive } from "class-validator";
import { CreateJobControlInput } from "./create-jobcontrol.input";

@InputType()
export class UpdateJobControlInput extends PartialType(CreateJobControlInput) {
  @Field(() => Int, { description: "id редактируемого контролёра " })
  @IsPositive()
  id!: number;
}
