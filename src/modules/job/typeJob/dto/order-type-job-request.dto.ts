import { Field, InputType } from "@nestjs/graphql";
import { OrderTypeJobEnum, SortEnum } from "src/common/enum/enum";

@InputType()
export class OrderTypeJobInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderTypeJobEnum)
  value: OrderTypeJobEnum;
}
