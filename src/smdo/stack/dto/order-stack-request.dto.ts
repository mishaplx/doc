import { Field, InputType } from "@nestjs/graphql";
import { OrderStackEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderStackInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderStackEnum)
  value: OrderStackEnum;
}
