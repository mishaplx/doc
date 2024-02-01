import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetCitizenArgs {
  @Field({ nullable: true, description: "Фамилия" })
  ln?: string;

  @Field({ nullable: true, description: "Имя" })
  nm?: string;

  @Field({ nullable: true, description: "Отчество" })
  mn?: string;

  @Field({ nullable: true, description: "Регион(город)" })
  region?: number;

  @Field({ nullable: true, description: "Адрес" })
  addr?: string;

  @Field({ nullable: true, description: "Электронная почта" })
  email?: string;
}
