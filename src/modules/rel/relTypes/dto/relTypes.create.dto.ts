import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class RelTypesCreate {
  @Field({ nullable: false, description: "Прямая связка" })
  name_direct: string;

  @Field({ nullable: false, description: "Обратная связка" })
  name_reverse: string;

  temp = false;
}
