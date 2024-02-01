import { Field, InputType } from "@nestjs/graphql";
import { OrderDocPackagesDeletedEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderDocPackagesDeletedInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderDocPackagesDeletedEnum)
  value: OrderDocPackagesDeletedEnum;
}
