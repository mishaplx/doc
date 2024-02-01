import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class NewtokenResponse {
  @Field()
  accessToken: string;
  @Field()
  refreshToken: string;
}
