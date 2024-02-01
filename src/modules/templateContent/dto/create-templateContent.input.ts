import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateTemplateContentInput {
  @Field({ description: "Наименование" })
  text!: string;
}
