import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateArticleInput } from "./create-article.input";

@InputType()
export class UpdateArticleInput extends PartialType(CreateArticleInput) {
  @Field(() => Int, { description: "Id статьи хранения" })
  id!: number;

  @Field({ nullable: true, description: "Актуальность статьи хранения" })
  is_actual?: boolean;
}
