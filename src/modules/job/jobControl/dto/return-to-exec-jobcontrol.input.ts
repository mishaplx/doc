import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsPositive, Length } from "class-validator";

@InputType()
export class ReturnToExecJobControlInput {
  @Field(() => Int, { description: "Id поручения" })
  @IsPositive()
  jobId!: number;

  @Field({ description: "Причина возврата" })
  @IsNotEmpty()
  @Length(1, 300)
  reason!: string;
}
