import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class GetArgTypeJob {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true, description: "Тип поручения" })
  nm?: string;

  @Field({ nullable: true, description: "Автор" })
  author?: string;
}