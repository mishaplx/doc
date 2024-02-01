import { Field, InputType } from "@nestjs/graphql";
import { OrderReceiverEnum, OrderTemplateContentEnum, SortEnum } from "../../../common/enum/enum";
@InputType()
export class OrderReceiverRequestDto {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderReceiverEnum)
  value: OrderReceiverEnum;
}
