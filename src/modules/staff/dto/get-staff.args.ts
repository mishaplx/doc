import { ArgsType, Field, ObjectType } from "@nestjs/graphql";

@ArgsType()
@ObjectType()
export class GetStaffArgs {
  @Field({ nullable: true, description: "Имя" })
  nm?: string;

  @Field({ nullable: true, description: "Фамилия" })
  ln?: string;

  @Field({ nullable: true, description: "Отчество" })
  mn?: string;

  @Field({ nullable: true, description: "Эл. почта" })
  eml?: string;

  @Field({ nullable: true, description: "Табельный номер" })
  personnal_number?: string;

  @Field({ nullable: true, description: "Телефон" })
  phone?: string;

  @Field({ nullable: true, description: "Дата рожд." })
  dob?: Date;

  @Field({
    nullable: true,
    description: "существует ли пользователь у сотрудника",
  })
  isHasUser?: boolean;
}
