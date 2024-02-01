import { Field, InputType } from "@nestjs/graphql";
@InputType()
export default class argInputDto {
  @Field({ nullable: false, description: "название группы" })
  nm: string;

  @Field({ nullable: true, description: "описание группы" })
  description: string;
}
