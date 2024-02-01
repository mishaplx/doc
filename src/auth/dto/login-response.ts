import { Field, Int, ObjectType } from "@nestjs/graphql";
import JSON from "graphql-type-json";

@ObjectType()
export class LoginResponse {
  @Field({ nullable: true })
  access_token: string;

  @Field({ nullable: true })
  refresh_token: string;

  @Field(() => [String], { nullable: true })
  viewing_access?: string[];

  @Field(() => JSON, { nullable: true })
  menu_ops_viewing?: any;

  @Field(() => Date, { nullable: true, description: 'Дата последнего входа в систему' })
  last_login?: Date;

  @Field(() => Int, { nullable: true, description: 'Количество сессий текущего пользователя' })
  count_session?: number;
}
