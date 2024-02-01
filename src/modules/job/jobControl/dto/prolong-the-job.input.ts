import { Field, InputType, Int } from "@nestjs/graphql";
import { IsDate, IsNotEmpty, IsPositive, Length } from "class-validator";

@InputType()
export class ProlongTheJobInput {
  @Field(() => Int, { description: "Id поручения" })
  @IsPositive()
  jobId!: number;

  @Field({ description: "Комментарий" })
  @IsNotEmpty()
  @Length(1, 286)
  comment!: string;

  @Field({ description: "Продлить до" })
  @IsDate()
  datePlan: Date;
}
