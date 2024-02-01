import { Field, ObjectType } from "@nestjs/graphql";

import { Doc_route_actionType } from "../dto/currentroute/doc_route_action";
import { TemplateRouteGetById } from "./templateRouteGetById";
@ObjectType()
export class TemplateRouteProjectType {
  @Field(() => TemplateRouteGetById, {
    description: "",
    nullable: true,
  })
  Result: TemplateRouteGetById;

  @Field(() => [Doc_route_actionType], {
    description: "",
    nullable: true,
  })
  Route: Doc_route_actionType[];
}
