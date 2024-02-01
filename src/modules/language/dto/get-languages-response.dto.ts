import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetLanguageArgs {
  @Field(() => Int, { nullable: true, description: "Id языка" })
  id: number;

  @Field({ nullable: true, description: "Наименование языка" })
  nm: string;

  @Field({ nullable: true, description: "RU код" })
  char_code_ru: string;

  @Field({ nullable: true, description: "EN код" })
  char_code_en: string;

  @Field({ nullable: true, description: "Цифровой код" })
  digit_code: string;
}
