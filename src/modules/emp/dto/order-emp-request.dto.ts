import { Field, InputType } from "@nestjs/graphql";
import { OrderEmpEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderEmpInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderEmpEnum)
  value: OrderEmpEnum;
}
