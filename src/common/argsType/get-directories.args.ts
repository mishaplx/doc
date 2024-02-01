import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetDirectoriesArgs {
  @Field(() => [Int], { nullable: true })
  ids?: number[];

  @Field({ nullable: true, description: "Наименование" })
  nm?: string;
}
