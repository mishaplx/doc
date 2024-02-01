import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetCdocArgs {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true, description: "Код класса документа" })
  code?: string;

  @Field({ nullable: true, description: "Наименование класса документа" })
  nm?: string;
}
