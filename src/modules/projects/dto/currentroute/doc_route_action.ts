import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { ActionType } from "./action";
import { SubActionType } from "./subAction";
@ObjectType("Doc_route_actionTypeObj")
@InputType("Doc_route_actionTypeInput")
export class Doc_route_actionType {
  @Field(() => ActionType, {
    nullable: true,
  })
  action: ActionType;

  @Field(() => SubActionType, {
    nullable: true,
  })
  subAction: SubActionType;
}
