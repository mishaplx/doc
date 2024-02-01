import { Field, InputType } from "@nestjs/graphql";
import { OrderProjectsTemplateEnum, SortEnum } from "../../../../common/enum/enum";

@InputType()
export class OrderProjectTemplateInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderProjectsTemplateEnum)
  value: OrderProjectsTemplateEnum;
}
