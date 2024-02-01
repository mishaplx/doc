import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ResponseRegistrate {
  @Field()
  login: string;
}
