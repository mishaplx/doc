import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetProjectTemplateArgs {
  @Field(() => Int, {
    nullable: true,
    description: "Номер записи",
  })
  id?: number;

  @Field({ nullable: true, description: "Наименование шаблона" })
  nm?: string;

  @Field({ nullable: true, description: "Дата события" })
  dtc?: Date;

  @Field({ nullable: true, description: "Вид документа" })
  tdoc?: number;
}
