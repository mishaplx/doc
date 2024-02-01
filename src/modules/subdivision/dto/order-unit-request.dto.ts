import { Field, InputType } from "@nestjs/graphql";
import { OrderUnitEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderUnitInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderUnitEnum)
  value: OrderUnitEnum;
}
