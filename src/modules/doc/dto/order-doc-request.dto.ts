import { Field, InputType } from "@nestjs/graphql";
import { OrderDocEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderDocInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderDocEnum)
  value: OrderDocEnum;
}
