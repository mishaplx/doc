import { Field, Int, ObjectType } from "@nestjs/graphql";
import { KdocEntity } from "../../../entity/#organization/doc/kdoc.entity";
import { TdocEntity } from "../../../entity/#organization/doc/tdoc.entity";
import { ActionType } from "../dto/ActionType";
@ObjectType()
export class TemplateRouteGetById {
  @Field(() => Int)
  id!: number;

  @Field(() => Int, {
    description: "Тип документа проекта",
    nullable: true,
  })
  type_document: number;

  @Field(() => KdocEntity, {
    description: "Тип документа проекта",
    nullable: true,
  })
  Typedoc: Promise<KdocEntity>;

  @Field(() => Int, {
    description: "Вид документа",
    nullable: true,
  })
  view_document: number;

  @Field(() => TdocEntity, {
    description: "Тип документа проекта",
    nullable: true,
  })
  Viewdoc: Promise<TdocEntity>;

  @Field(() => String, {
    description: "наименование маршрута для проектов документа",
    nullable: true,
  })
  name: number;

  @Field(() => [Int], {
    description: "массив маршрута документа",
    nullable: true,
  })
  doc_route: number[];

  @Field(() => [ActionType], {
    description: "дополнительные действия наименование маршрута для проектов документа ",
    nullable: true,
  })
  doc_route_action: ActionType[];
}
