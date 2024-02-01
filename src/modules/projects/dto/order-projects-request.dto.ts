import { Field, InputType } from "@nestjs/graphql";
import { OrderProjectsEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
export class OrderProjectsInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderProjectsEnum)
  value: OrderProjectsEnum;
}
