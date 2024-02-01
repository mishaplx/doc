import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType()
@ObjectType()
export class UpdateUserDto {
  @Field({ nullable: false, description: "id пользователя" })
  id?: number;
  //
  // @Field({ nullable: true, description: 'Имя пользователя' })
  // name: string;
  //
  // @Field({ nullable: true, description: 'Фамилия пользователя' })
  // lastname: string;
  //
  // @Field({ nullable: true, description: 'Отчество пользователя' })
  // middlename: string;

  @Field({ nullable: true, description: "логин для входя в систему" })
  username: string;
  //
  // @Field({ nullable: true, description: 'Эл. почта' })
  // email?: string;
}
