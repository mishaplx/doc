import { Field, InputType } from "@nestjs/graphql";
import { OrderRefTypesEnum, SortEnum } from "../../../../common/enum/enum";

@InputType()
export class OrderRefTypesInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderRefTypesEnum)
  value: OrderRefTypesEnum;
}
