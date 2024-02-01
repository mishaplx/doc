import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetAbonentsArgs {
  @Field({ nullable: true, description: "Наименование" })
  nm?: string;

  @Field({ nullable: true, description: "Сокращённое наименование" })
  short_nm?: string;

  @Field({ nullable: true, description: "Код" })
  smdo_code?: string;

  @Field({ nullable: true, description: "Id записи" })
  row_id?: string;

  @Field({ nullable: true, description: "Статус подписчика" })
  status_smdo?: string;
}
