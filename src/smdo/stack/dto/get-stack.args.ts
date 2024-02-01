import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetStackArgs {
  @Field({ nullable: true, description: "Идентификатор" })
  id?: number;

  @Field(() => [Int], { nullable: true, description: "Идентификатор(массив)" })
  ids?: number[];

  @Field({ nullable: true, description: "Признак активности" })
  is_active?: boolean;

  @Field({ nullable: true, description: "Последняя дата отправки" })
  send_time?: Date;

  @Field({ nullable: true, description: "Дата создания" })
  dtc?: Date;

  @Field({ nullable: true, description: "Рег. номер документа" })
  regNum?: string;

  @Field({ nullable: true, description: "Вид документа" })
  tdoc?: number;

  @Field({ nullable: true, description: "Заголовок" })
  title?: string;

  @Field({ nullable: true, description: "Получатели" })
  receivers?: string;
}
