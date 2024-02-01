import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateJobCtrTypeInput } from "./create-jobCtrType.input";

@InputType()
export class UpdateJobCtrTypeInput extends PartialType(CreateJobCtrTypeInput) {
  @Field(() => Int, { description: "Id типа контроля" })
  id!: number;
}
