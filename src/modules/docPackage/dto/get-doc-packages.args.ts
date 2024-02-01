import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetDocPackagesArgs {
  @Field(() => Int, { nullable: true, description: "Id дела." })
  id?: number;

  @Field(() => Int, { nullable: true, description: "Год." })
  year?: number;

  @Field({ nullable: true, description: "Наименование." })
  name?: string;

  @Field({ nullable: true, description: "Индекс." })
  ind?: string;

  @Field(() => Int, { nullable: true, description: "Статья хранения." })
  article_id?: number;

  @Field({ nullable: true, description: "Комментарий по хранению." })
  storage_comment?: string;

  @Field({ nullable: true, description: "Статья хранения." })
  term?: string;

  @Field({ nullable: true, description: "Примечание." })
  nt?: string;

  @Field(() => Int, { nullable: true, description: "Статус дела." })
  status_id?: number;

  @Field(() => Int, { nullable: true, description: "Опись, в которой содержится дело." })
  inventory_id?: number;

  @Field({ nullable: true, description: "Опись." })
  inventory_name?: string;

  @Field(() => Int, { nullable: true, description: "Количество документов." })
  count_doc?: number;

  @Field(() => Int, { nullable: true, description: "Количество файлов." })
  count_file?: number;

  @Field({ nullable: true, description: "Начальная дата документов." })
  start_date?: Date;

  @Field({ nullable: true, description: "Конечная дата документов." })
  end_date?: Date;

  @Field(() => Int, { nullable: true, description: "Дела, для включения в опись. Id описи." })
  for_include_inventory?: number;

  @Field(() => Int, { nullable: true, description: "Дела, для включения в акт. Id акта." })
  for_include_act?: number;

  @Field(() => Int, { nullable: true, description: "Дела, для включения в акт. Id акта." })
  include_act?: number;

  @Field(() => Int, { nullable: true, description: "Дела, в аке. Id акта." })
  in_act?: number;

  @Field(() => Int, { nullable: true, description: "Дела, для включения в опись. Id описи." })
  include_inventory?: number;

  @Field(() => Int, { nullable: true, description: "Дела, в описи. Id описи." })
  in_inventory?: number;
}
