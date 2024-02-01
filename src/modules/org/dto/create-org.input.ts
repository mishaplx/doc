import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateOrgInput {
  @Field({ description: "Наименование" })
  nm!: string;

  @Field({ description: "Полное наименование" })
  fnm!: string;

  @Field(() => Int, { nullable: true, description: "Id региона" })
  region: number;

  @Field({ nullable: true, description: "Адресс" })
  adress: string;

  @Field({ nullable: true, description: "Телефон" })
  phone: string;

  @Field({ nullable: true, description: "Факс" })
  fax: string;

  @Field({ nullable: true, description: "Эл. почта" })
  email: string;

  @Field({ nullable: true, description: "Название в СМД" })
  smdocode: string;

  del!: boolean;
  temp!: boolean;
}
