import { Field, InputType } from "@nestjs/graphql";
import { OrderActEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderActInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderActEnum)
  value: OrderActEnum;
}
