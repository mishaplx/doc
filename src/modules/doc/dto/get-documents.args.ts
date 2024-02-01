import { ArgsType, Field, Int } from "@nestjs/graphql";
import JSON from "graphql-type-json";
import { PartiesDocs } from "../doc.const";

@ArgsType()
export class GetDocumentsArgs {
  @Field(() => Int, {
    nullable: true,
    description: "Тип документа",
  })
  cls: number;

  @Field(() => Int, {
    nullable: true,
    description: "Статус документа",
  })
  docstatus?: number;

  @Field({ nullable: true, description: "Автор" })
  author?: string;

  @Field(() => JSON, { nullable: true, description: "ID" })
  id?: any;

  @Field({ nullable: true, description: "Содержание" })
  body?: string;

  @Field({ nullable: true, description: "Рег.№" })
  regNum?: string;

  @Field(() => Int, { nullable: true, description: "Вид документа" })
  tdoc?: number;

  @Field({ nullable: true, description: "От" })
  dr?: Date;

  @Field(() => Int, { nullable: true, description: "Доступ" })
  priv?: number;

  @Field({ nullable: true, description: "Корреспондент" })
  citizen?: string;

  @Field({ nullable: true, description: "Исх.№(номер)" })
  outnum?: string;

  @Field({ nullable: true, description: "Исходящая дата" })
  outd?: Date;

  @Field({ nullable: true, description: "Подписал" })
  signed?: string;

  @Field({ nullable: true, description: "Примечание" })
  nt?: string;

  @Field({ nullable: true, description: "Тип доставки" })
  delivery?: string;

  @Field(() => Int, { nullable: true, description: "Номенклатура" })
  nmncl?: number;

  @Field(() => Int, { nullable: true, description: "Id дела" })
  doc_package_id?: number;

  @Field({ nullable: true, description: "Индекс дела" })
  doc_package_index?: string;

  @Field(() => Int, { nullable: true, description: "Статус дела" })
  doc_package_status?: number;

  @Field(() => Int, { nullable: true, description: "Опись" })
  inventory_id?: number;

  @Field(() => String, { nullable: true, description: "Заголовок" })
  header?: string;

  @Field(() => PartiesDocs, {
    nullable: true,
    description: "Кем является пользователь в документе",
  })
  user?: PartiesDocs;
}
