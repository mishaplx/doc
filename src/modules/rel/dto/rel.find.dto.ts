import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class RelGet {
  @Field(() => Int, { nullable: true, description: "id" })
  id?: number;

  @Field(() => Int, { nullable: true, description: "Тип связки: id" })
  rel_types_id?: number;

  @Field(() => Int, { nullable: true, description: "Прямая связка: id" })
  doc_direct_id?: number;

  @Field(() => Int, { nullable: true, description: "Обратная связка: id" })
  doc_reverse_id?: number;

  @Field(() => Int, { nullable: true, description: "Прямая или обратная связка: id" })
  doc_id?: number;

  @Field({ nullable: true, defaultValue: false, description: "Признак удаления" })
  del?: boolean;
}
