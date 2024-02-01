import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetUnitArgs {
  @Field({ nullable: true, description: "Код подразделения" })
  code?: string;

  @Field({ nullable: true, description: "Наименование" })
  nm?: string;

  @Field({ nullable: true, description: "Сокращенное наименование" })
  short_name?: string;

  @Field({ nullable: true, description: "Дата с" })
  db?: Date;

  @Field({ nullable: true, description: "Дата по" })
  de?: Date;

  @Field(() => Int, { nullable: true, description: "Вышестоящее подразделение" })
  parent_unit?: number;
}
