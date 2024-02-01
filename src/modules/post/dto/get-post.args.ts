import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetPostArgs {
  @Field({ nullable: true, description: "Наименование" })
  nm?: string;
}
