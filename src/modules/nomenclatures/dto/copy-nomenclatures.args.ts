import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class CopyNomenclaturesArgs {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "Наименование." })
  name: number;
}
