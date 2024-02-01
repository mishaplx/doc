import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetAuditArgs {
  @Field(() => Int, {
    nullable: true,
    description: "Номер записи",
  })
  id?: number;

  @Field({ nullable: true, description: "Автор" })
  fio?: string;

  @Field({ nullable: true, description: "Описание" })
  description?: string;

  @Field({ nullable: true, description: "IP Адрес" })
  ip?: string;

  @Field({ nullable: true, description: "Тип" })
  type?: string;

  @Field({ nullable: true, description: "Событие" })
  event?: string;

  @Field({ nullable: true, description: "Дата события" })
  dtc?: Date;

  @Field(() => Int, { nullable: true, description: "Хэш" })
  hash?: number;
}
