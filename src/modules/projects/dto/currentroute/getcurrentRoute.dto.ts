import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Doc_route_actionType } from "./doc_route_action";

@ObjectType()
export class GetcurrentRouteDto {
  @Field(() => Int, {
    description: "дополнительные действия наименование маршрута для проектов документа ",
    nullable: true,
  })
  id: number;

  @Field(() => String, {
    description: "дополнительные действия наименование маршрута для проектов документа ",
    nullable: true,
  })
  name: string;

  @Field(() => [Doc_route_actionType], {
    description: "дополнительные действия наименование маршрута для проектов документа ",
    nullable: true,
  })
  doc_route_action: [Doc_route_actionType];
}
