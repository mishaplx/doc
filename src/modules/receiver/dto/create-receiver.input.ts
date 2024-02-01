import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateReceiverInput {
  @Field({ description: "Наименование" })
  receiver_name!: string;
}
