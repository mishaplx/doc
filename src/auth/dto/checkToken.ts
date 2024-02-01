import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class CheckToken {
  @Field()
  userId: number;
  @Field()
  name: string;
  @Field()
  accessToken: string;
  @Field({ description: " время создания токена" })
  iat: number;
  @Field({ description: "срок действия токена" })
  exp: number;
  @Field()
  refreshToken: string;
}
