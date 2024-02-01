import { Field, InputType } from "@nestjs/graphql";
import { OrderTdocEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderTdocInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderTdocEnum)
  value: OrderTdocEnum;
}
