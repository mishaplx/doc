import { ArgsType, Field, ObjectType } from "@nestjs/graphql";

@ArgsType()
@ObjectType()
export class createUserDto {
  @Field({ description: "Имя пользователя" })
  name: string;

  @Field({ description: "Фамилия пользователя" })
  lastname: string;

  @Field({ description: "Login пользователя" })
  username: string;

  @Field({ description: "подразделение пользователя" })
  unit: string;

  @Field({ description: "пороль" })
  pass: string;

  @Field({ description: "пороль", defaultValue: "" })
  rt: string;

  @Field({ description: "флаг удаления пользователя", defaultValue: false })
  del: boolean;

  @Field({ description: "роль пользователя в системе" })
  role: number;
  @Field({ description: "", defaultValue: true })
  active: boolean;
}
