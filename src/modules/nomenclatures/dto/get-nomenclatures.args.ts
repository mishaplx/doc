import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetNomenclaturesArgs {
  @Field(() => Int, { nullable: true, description: "Вышестоящая номенклатура." })
  parent_id?: number;

  @Field({ nullable: true, description: "Наименование." })
  name?: string;

  @Field({ nullable: true, description: "Индекс." })
  index?: string;

  @Field({ nullable: true, description: "Примечание." })
  nt?: string;

  @Field({ nullable: true, description: "Комментарий по хранению." })
  storage_comment?: string;

  @Field(() => Int, { nullable: true, description: "Статья хранения." })
  article_id?: number;
}
