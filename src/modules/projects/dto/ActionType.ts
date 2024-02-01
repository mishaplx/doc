import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { Project_route_actionType } from "./DefaultStageType";

@InputType("ActionTypeInput", { isAbstract: true })
@ObjectType("ActionTypeObj")
export class ActionType {
  @Field(() => Int, {
    nullable: true,
    description: "id из запроса getAllAction",
  })
  action: number;
  @Field(() => String, {
    nullable: true,
    description: "id из запроса getAllAction",
  })
  action_name: string;

  @Field(() => [Project_route_actionType], {
    description: "id из запроса getAllSubAction",
    nullable: true,
  })
  subAction: Project_route_actionType[];
}
