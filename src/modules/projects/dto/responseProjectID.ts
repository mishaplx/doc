import { Field, ObjectType } from "@nestjs/graphql";
import { ProjectEntity } from "../../../entity/#organization/project/project.entity";
import { Doc_route_actionType } from "./currentroute/doc_route_action";

@ObjectType()
export class ResponseProjectID {
  @Field(() => ProjectEntity)
  project: ProjectEntity;

  @Field(() => [Doc_route_actionType])
  Route: Doc_route_actionType[];
}
