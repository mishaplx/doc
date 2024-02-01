import { Field, InputType } from "@nestjs/graphql";
import { OrderPackagesEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderPackagesInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderPackagesEnum)
  value: OrderPackagesEnum;
}
