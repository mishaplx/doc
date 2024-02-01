import { Field, InputType } from "@nestjs/graphql";
import { Length } from "class-validator";

export interface ILoginUserInputUp {
  staff_id: number;
  username: string;
  password: string;
}

@InputType()
export class LoginUserInputUp implements ILoginUserInputUp {
  // данные по регистрации пользователя
  @Field({
    description: "id сотрудника из запроса getAllstaff",
    nullable: false,
  })
  staff_id: number;

  @Field({ description: "логин", nullable: false })
  username: string;

  @Field({ nullable: false, description: "пароль" })
  @Length(5)
  password: string;

  active: boolean;
}
