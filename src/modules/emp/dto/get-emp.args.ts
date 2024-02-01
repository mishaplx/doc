import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetEmpArgs {
  @Field(() => Int, { nullable: true, description: "Должность" })
  post?: number;

  @Field({ nullable: true, description: "ФИО" })
  fio?: string;

  @Field({ nullable: true, description: "Табельный номер" })
  personnal_number?: string;

  @Field(() => Int, { nullable: true, description: "Подразделение" })
  unit?: number;

  @Field(() => Int, { nullable: true, description: "Роль" })
  role?: number;

  @Field({ nullable: true, description: "Дата назначения" })
  db?: Date;

  @Field({ nullable: true, description: "Дата прекращения" })
  de?: Date;
}
