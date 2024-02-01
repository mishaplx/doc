import { Field, InputType } from "@nestjs/graphql";
import { OrderAbonentsEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderAbonentsInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderAbonentsEnum)
  value: OrderAbonentsEnum;
}
