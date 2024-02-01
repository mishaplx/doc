import { Field, InputType } from "@nestjs/graphql";
import { OrderAuditEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderAuditInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderAuditEnum)
  value: OrderAuditEnum;
}
