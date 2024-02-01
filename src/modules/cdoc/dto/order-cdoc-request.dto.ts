import { Field, InputType } from "@nestjs/graphql";
import { OrderCdocEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderCdocInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderCdocEnum)
  value: OrderCdocEnum;
}
