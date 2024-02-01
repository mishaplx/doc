import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { OrderRolesEnum, SortEnum } from "../../../common/enum/enum";

@InputType()
@ObjectType()
export class OrderRolesInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderRolesEnum)
  value: OrderRolesEnum;
}
