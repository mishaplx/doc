import { Field, InputType } from "@nestjs/graphql";
import { OrderArticleEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderArticleInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderArticleEnum)
  value: OrderArticleEnum;
}
