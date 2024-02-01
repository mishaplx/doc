import { Field, InputType } from "@nestjs/graphql";
import { OrderAuthEnum, SortEnum } from "../../common/enum/enum";

@InputType()
export class OrderAuthInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderAuthEnum)
  value: OrderAuthEnum;
}
