import { Field, ObjectType } from "@nestjs/graphql";
import { StaffEntity } from "../../../entity/#organization/staff/staff.entity";
@ObjectType()
export class UserType {
  // данные по регистрации пользователя
  @Field({ nullable: true, description: "Имя пользователя" })
  id?: number;

  @Field({ nullable: false, description: "Login пользователя" })
  username: string;

  @Field(() => StaffEntity, {
    nullable: false,
    description: "staff",
  })
  Staff?: StaffEntity;
}
