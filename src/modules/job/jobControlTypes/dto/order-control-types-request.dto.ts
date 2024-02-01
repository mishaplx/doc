import { Field, InputType } from "@nestjs/graphql";
import { OrderControlTypesEnum, SortEnum } from "src/common/enum/enum";

@InputType()
export class OrderControlTypesInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderControlTypesEnum)
  value: OrderControlTypesEnum;
}
