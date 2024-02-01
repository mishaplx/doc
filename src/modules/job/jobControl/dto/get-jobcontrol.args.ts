import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsPositive } from "class-validator";

@ArgsType()
export class GetJobControlArgs {
  @Field(() => [Int], { nullable: true })
  ids?: number[];

  @Field(() => Int, { description: "Id поручения" })
  @IsPositive()
  jobId: number;
}
