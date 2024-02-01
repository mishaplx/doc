import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateReceiverInput } from "./create-receiver.input";

@InputType()
export class UpdateReceiverInput extends PartialType(CreateReceiverInput) {
  @Field(() => Int, {
    nullable: true,
    description: "id записи",
  })
  id!: number;

  @Field(() => String, {
    description: "текст обновления",
  })
  receiver_name!: string;
}
