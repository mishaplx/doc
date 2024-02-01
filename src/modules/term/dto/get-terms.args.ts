import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetTermArgs {
  @Field({ nullable: true, description: "Наименование" })
  nm?: string;
}
