import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { ActionType } from "../dto/ActionType";

@InputType()
@ObjectType()
export class TemplateRouteUpdate {
  @Field(() => Int, {
    description: "Тип документа проекта",
    nullable: true,
  })
  type_document: number;

  @Field(() => Int, {
    description: "Id- проекта",
    nullable: true,
  })
  projectId: number;
  @Field(() => Int, {
    description: "Вид документа",
    nullable: true,
  })
  view_document: number;

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
