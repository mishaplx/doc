import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Length } from "class-validator";
import { languagesI } from "../../../entity/#organization/doc/doc.entity";
import { Doc_route_actionType } from "./currentroute/doc_route_action";

@InputType("ProjectUpdate")
@ObjectType("ProjectUpdate")
export class ProjectUpdate {
  @Field(() => Int, {
    description: "id проекта",
    nullable: true,
  })
  id: number;
  @Length(1, 1000)
  @Field({
    description: "наименование проекта",
    nullable: true,
  })
  nm: string;
  @Length(1, 2000)
  @Field({
    description: "краткое содержание",
  })
  short_body: string;

  @Field(() => Int, {
    description: "Исполнитель проекта",
    nullable: true,
  })
  executor: number;
  temp: boolean;

  @Field(() => Int, {
    description: "Тип документа проекта",
    nullable: false,
  })
  type_document: number;

  @Field(() => Boolean, {
    description: "нужна ли подпись",
    nullable: false,
    defaultValue: false,
  })
  isSign: boolean;

  @Field(() => Int, {
    description: "Вид документа",
    nullable: false,
  })
  view_document: number;

  @Field(() => [Doc_route_actionType], {
    description: "маршрут документа",
    nullable: false,
  })
  route_project: Doc_route_actionType[];

  @Field(() => String, {
    description: "наименование маршрута проекта",
    nullable: false,
  })
  route_project_name: string;

  @Field(() => [languagesI], { nullable: true })
  languages: [languagesI];

  is_sing_date: Date | null;
}
