import { Field, InputType, Int } from "@nestjs/graphql";
import { IsPositive } from "class-validator";

@InputType()
export class GetOutOfControlInput {
  @Field(() => Int, { description: "Id поручения" })
  @IsPositive()
  jobId!: number;
}
