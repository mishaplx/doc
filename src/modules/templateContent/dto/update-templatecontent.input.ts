import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateTemplateContentInput } from "./create-templateContent.input";

@InputType()
export class UpdateTemplatecontentInput extends PartialType(CreateTemplateContentInput) {
  @Field(() => Int, {
    nullable: true,
    description: "id записи",
  })
  id!: number;

  @Field(() => String, {
    description: "текст обновления",
  })
  text!: string;
}
