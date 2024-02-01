import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class CreateArticleInput {
  @Field({ description: "Наименование статьи" })
  @IsNotEmpty()
  nm!: string;

  @Field({ description: "Код статьи" })
  @IsNotEmpty()
  cd!: string;

  @Field({ description: "Срок хранения" })
  @IsNotEmpty()
  term_id!: number;
}
