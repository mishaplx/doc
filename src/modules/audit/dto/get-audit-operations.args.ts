import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetAuditOperationsArgs {
  @Field(() => Int, {
    nullable: true,
    description: "Номер записи",
  })
  id?: number;

  @Field({ nullable: true, description: "Тип" })
  type?: number;

  @Field({ nullable: true, description: "Наименование" })
  name?: string;

  @Field({ nullable: true, description: "Метод" })
  method?: string;

  @Field({ nullable: true, description: "Признак включения" })
  is_enabled?: string;

  @Field({ nullable: true, description: "Дата события" })
  dtc?: Date;
}
