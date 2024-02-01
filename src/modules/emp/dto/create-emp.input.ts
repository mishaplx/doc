import { Field, InputType, Int } from "@nestjs/graphql";
import { IsPositive } from "class-validator";
import { CreateDateColumn } from "typeorm";

@InputType()
export class CreateEmpInput {
  @Field(() => Int, { nullable: false, description: "Подразделение" })
  @IsPositive()
  unit_id!: number;

  @Field(() => Int, { nullable: false, description: "Должность" })
  @IsPositive()
  post_id?: number;

  @Field(() => Int, { nullable: false, description: "Данные сотрудника" })
  @IsPositive()
  staff_id: number;

  @Field(() => [Int], {
    nullable: true,
    description: "массив id ролей на назначение",
  })
  roles: any[any];

  @Field(() => Int, { nullable: true, description: "Организация" })
  org: number;

  @CreateDateColumn({ nullable: true, comment: "Дата назначения" })
  @Field({ nullable: true, description: "Дата назначения" })
  db?: Date;

  @Field({ nullable: true, description: "Дата прекращения" })
  de?: Date;

  user_id!: number;

  @Field(() => Boolean, { nullable: true, description: "Отключать RLS политику (подключение к БД как админ), роли" })
  is_admin: boolean;

  @Field(() => Boolean, { nullable: true, description: "Частично отключать RLS политику (подключение к БД как пользователь), роли" })
  is_register: boolean;

  @Field(() => Boolean, { nullable: true, description: "Частично отключать RLS политику для подразделения (подключение к БД как пользователь), роли" })
  is_register_unit: boolean;
}
