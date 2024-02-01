import { Field, InputType } from "@nestjs/graphql";
import { OrderOrgEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderOrgInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderOrgEnum)
  value: OrderOrgEnum;
}
