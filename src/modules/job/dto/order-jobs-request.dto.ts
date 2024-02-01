import { Field, InputType } from "@nestjs/graphql";
import { SortEnum } from "../../../common/enum/enum";
import { OrderJobsEnum } from "../job.const";

@InputType()
export class OrderJobsInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderJobsEnum)
  value: OrderJobsEnum;
}
