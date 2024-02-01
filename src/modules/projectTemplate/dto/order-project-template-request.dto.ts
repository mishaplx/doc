import { Field, InputType } from "@nestjs/graphql";
import { OrderProjectTemplateEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderProjectTemplateXInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderProjectTemplateEnum)
  value: OrderProjectTemplateEnum;
}
