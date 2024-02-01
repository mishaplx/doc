import { Field, InputType } from "@nestjs/graphql";
import { OrderIncmailsEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderIncmailsInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderIncmailsEnum)
  value: OrderIncmailsEnum;
}
