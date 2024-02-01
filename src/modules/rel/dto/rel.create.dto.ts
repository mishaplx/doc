import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class RelCreate {
  @Field(() => Int, { nullable: false, description: "Тип связки: id" })
  rel_types_id: number;

  @Field(() => Int, { nullable: false, description: "Прямая связка: id" })
  doc_direct_id: number;

  @Field(() => Int, { nullable: false, description: "Обратная связка: id" })
  doc_reverse_id: number;
}
