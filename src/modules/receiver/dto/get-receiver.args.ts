import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetReceiverArgs {
  @Field({ nullable: true, description: "текст" })
  receiver_name?: string;
}
