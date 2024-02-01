import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";
import { OrderTemplateContentEnum, SortEnum } from "../../../common/enum/enum";
@InputType()
export class OrderTemplateContentInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderTemplateContentEnum)
  value: OrderTemplateContentEnum;
}
