import { Field, InputType, ObjectType } from "@nestjs/graphql";
@InputType()
@ObjectType()
export class UpdateDto {
  @Field()
  id: number;
  @Field()
  nm: string;
}
