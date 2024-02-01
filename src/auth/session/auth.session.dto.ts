import { Field, InputType } from "@nestjs/graphql";
import { OrderUserSessionEnum, SortEnum } from "src/common/enum/enum";

@InputType()
export class OrderUserSessionInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderUserSessionEnum)
  value: OrderUserSessionEnum;
}
