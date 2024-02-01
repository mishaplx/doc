import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetOperationArgs {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => [Int], { nullable: true, description: "Id, которые исключить из выборки" })
  notIds?: number[];

  @Field({ nullable: true, description: "Наименование" })
  name?: string;

  @Field(() => Int, { nullable: true, description: "Пункт меню" })
  menu?: number;
}
