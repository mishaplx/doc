import { Field, InputType } from "@nestjs/graphql";
import { OrderGroupEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderGroupInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderGroupEnum)
  value: OrderGroupEnum;
}
