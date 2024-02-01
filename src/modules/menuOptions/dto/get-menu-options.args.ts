import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetMenuOptionsArgs {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true, description: "Наименование" })
  nm?: string;
}
