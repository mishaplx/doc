import { Field, InputType } from "@nestjs/graphql";
import { OrderCatalogEnum, SortEnum } from "../enum/enum";

@InputType()
export class OrderCatalogInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderCatalogEnum)
  value: OrderCatalogEnum;
}
