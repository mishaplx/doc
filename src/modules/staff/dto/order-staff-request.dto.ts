import { Field, InputType } from "@nestjs/graphql";

import { OrderStaffEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderStaffInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderStaffEnum)
  value: OrderStaffEnum;
}
