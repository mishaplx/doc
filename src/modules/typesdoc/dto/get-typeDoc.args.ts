import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetTypeDocArgs {
  @Field({ nullable: true, description: "Название" })
  nm?: string;

  @Field({ nullable: true, description: "Код вида" })
  code?: string;

  @Field(() => Int, { nullable: true, description: "Название в СМДО" })
  smdoDocTypes?: number;
}
