import { ArgsType, Field, InputType, Int } from "@nestjs/graphql";

@ArgsType()
@InputType()
export class ElementNmnclInput {
  @Field(() => Int, { description: "Вышестоящая номенклатура" })
  parent_id: number;

  @Field({ description: "Наименование" })
  name: string;

  @Field({ description: "Индекс" })
  index: string;

  @Field(() => Int, { nullable: true, description: "Статья хранения" })
  article_id: number;

  @Field({ nullable: true, description: "Примечание" })
  nt: string;

  @Field({ nullable: true, description: "Комментарий по хранению" })
  storage_comment: string;

  serial_number: number;
  main_parent_id: number;
}
