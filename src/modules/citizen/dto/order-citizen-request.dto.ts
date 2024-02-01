import { Field, InputType } from "@nestjs/graphql";
import { OrderCitizenEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderCitizenInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderCitizenEnum)
  value: OrderCitizenEnum;
}
