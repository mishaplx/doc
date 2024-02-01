import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class CreateStaffInput {
  @Field({ nullable: false, description: "Имя" })
  nm?: string;

  @Field({ nullable: false, description: "Фамилия" })
  @IsNotEmpty()
  ln!: string;

  @Field({ nullable: true, description: "Отчество" })
  mn?: string;

  @Field({ nullable: false, description: "Эл. почта" })
  eml?: string;

  @Field({ nullable: false, description: "Телефон" })
  phone!: string;

  @Field({ nullable: true, description: "Табельный номер" })
  personnal_number: string;

  @Field({ nullable: true, description: "Дата рожд." })
  dob?: Date;
}
