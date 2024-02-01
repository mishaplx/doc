import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
@ObjectType("ActionTypeObjType")
@InputType("ActionTypeInp")
export class ActionType {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  label: string;
}
