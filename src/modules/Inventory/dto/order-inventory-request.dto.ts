import { Field, InputType } from "@nestjs/graphql";
import { OrderInventoryEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderInventoryInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderInventoryEnum)
  value: OrderInventoryEnum;
}
