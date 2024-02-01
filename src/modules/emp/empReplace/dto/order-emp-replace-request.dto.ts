import { Field, InputType } from "@nestjs/graphql";
import { OrderEmpReplaceEnum, SortEnum } from "../../../../common/enum/enum";

@InputType()
export class OrderEmpReplaceInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderEmpReplaceEnum)
  value: OrderEmpReplaceEnum;
}
