import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsPositive } from "class-validator";

@ArgsType()
export class GetGroupArgs {
  @Field(() => [Int], { nullable: true })
  ids?: number[];

  @Field(() => Int, { description: "Id группы" })
  @IsPositive()
  groupId: number;
}
