import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class RelTypesGet {
  @Field(() => Int, { nullable: true, description: "id" })
  id?: number;

  @Field({ nullable: true, description: "Прямая связка" })
  name_direct?: string;

  @Field({ nullable: true, description: "Обратная связка" })
  name_reverse?: string;

  @Field({ nullable: true, defaultValue: false, description: "Признак удаления" })
  del?: boolean;
}
