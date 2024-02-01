import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetArticleArgs {
  @Field({ nullable: true, description: "Наименование" })
  nm?: string;

  @Field({ nullable: true, description: "Статья хранения" })
  cd?: string;

  @Field({ nullable: true, description: "Срок хранения" })
  term_nm?: string;

  @Field({ nullable: true, description: "Актуальность" })
  is_actual?: boolean;
}
