import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetRoleArgs {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true, description: "Наименование." })
  name?: string;

  @Field({ nullable: true, description: "Примечание." })
  nt?: string;

  @Field({ nullable: true, description: "Дата обновления." })
  updated_at?: Date;

  @Field(() => String, { nullable: true, description: "Редактор." })
  editor?: string;

  @Field(() => Boolean, { nullable: true, description: "Блокировка роли." })
  locked?: boolean;

  @Field(() => Int, { nullable: true, description: "Id операции." })
  operation?: number;
}
