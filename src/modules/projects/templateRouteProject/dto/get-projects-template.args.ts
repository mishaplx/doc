import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetProjectsTemplateArgs {
  @Field({ nullable: true, description: "Наименование шаблона." })
  name?: string;

  @Field(() => Int, { nullable: true, description: "Тип документа." })
  type_doc?: number;

  @Field(() => Int, { nullable: true, description: "Вид документа." })
  view_doc?: number;
}
