import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetOrgsArgs {
  @Field({ nullable: true, description: "Наименование (полное)" })
  fnm?: string;

  @Field({ nullable: true, description: "Наименование (сокращённое)" })
  nm?: string;

  @Field(() => Int, { nullable: true, description: "Регион (город)" })
  region?: number;

  @Field({ nullable: true, description: "Адрес" })
  adress?: string;

  @Field({ nullable: true, description: "Телефон" })
  phone?: string;

  @Field({ nullable: true, description: "Факс" })
  fax?: string;

  @Field({ nullable: true, description: "Электронная почта" })
  email?: string;

  @Field({ nullable: true, description: "Название в СМД" })
  smdo_abonent?: string;
}
