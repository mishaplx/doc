import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetAuthArgs {
  @Field({ nullable: true, description: "ФИО" })
  fio?: string;

  @Field({ nullable: true, description: "Дата регистрации" })
  dtc?: Date;

  @Field({ nullable: true, description: "Логин" })
  login?: string;

  @Field({ nullable: true, description: "Табельный номер" })
  personnal_number?: string;
}
