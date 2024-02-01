import { Field, InputType } from "@nestjs/graphql";
import { OrderAuditOperationsEnum, SortEnum } from "src/common/enum/enum";

@InputType()
export class OrderAuditOperationsInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderAuditOperationsEnum)
  value: OrderAuditOperationsEnum;
}
