import { Field, InputType, ObjectType } from "@nestjs/graphql";
@InputType()
@ObjectType()
export class InputDto {
  @Field()
  nm: string;
}
