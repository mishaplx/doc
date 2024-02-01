import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Info {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  error: string;
}
