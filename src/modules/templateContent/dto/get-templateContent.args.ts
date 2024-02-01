import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetTemplateContentArgs {
  @Field({ nullable: true, description: "текст" })
  text?: string;
}
