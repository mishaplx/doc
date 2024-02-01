import { Field, InputType } from "@nestjs/graphql";
import { OrderDocPackagesEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderDocPackagesInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderDocPackagesEnum)
  value: OrderDocPackagesEnum;
}
