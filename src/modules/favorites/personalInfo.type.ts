import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PersonalInfo {
  @Field(() => String)
  fio: string;
  @Field(() => String)
  post: string;
  @Field(() => String)
  unit: string;
  @Field(() => String)
  phone: string;
  @Field(() => String)
  email: string;
  @Field(() => String)
  login: string;
  @Field(() => Int)
  idUser: number;
}
