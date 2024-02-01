import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { ActionType } from "../ActionType";
@ObjectType()
@InputType()
export class AddTemplateRouteDtoDto {
  @Field(() => Number)
  type_doc: number;
  @Field(() => Number)
  view_doc: number;
  @Field(() => String)
  name: string;
  @Field(() => [ActionType])
  Action: [ActionType];
}
