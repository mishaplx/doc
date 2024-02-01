import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class ToDocIncmailInput {
  @Field(() => [Int])
  ids: number[];

  @Field(() => Int, { description: "Тип документа" })
  cls: number;
}
