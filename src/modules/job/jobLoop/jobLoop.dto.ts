import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
} from "@nestjs/graphql";
import { IsDate, IsPositive } from "class-validator";
import { JobLoopKindEnum, JobLoopMonthEnum } from "../../../BACK_SYNC_FRONT/enum/enum.job";
import { NotifyEntity } from "../../../entity/#organization/notify/notify.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedNotifyResponse extends PaginatedResponse(NotifyEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int, { description: "Поручение: id" })
  @IsPositive()
  job_id: number;

  @Field(() => GraphQLISODateTime, { description: "Начало повторов: дата" })
  @IsDate()
  start_date: Date;

  @Field(() => GraphQLISODateTime, { description: "Завершение повторов: дата" })
  @IsDate()
  end_date: Date;

  @Field(() => Int, { description: "Завершение повторов: количество циклов" })
  @IsPositive()
  // @Max(JOB.LOOP_MAX, { message: "Не более "+JOB.LOOP_MAX+" повторов"})
  end_count: number;

  @Field(() => JobLoopKindEnum, { description: "Периодичность: вид (день, неделя, ...)" })
  loop_kind: JobLoopKindEnum;

  @Field(() => Int, { description: "Периодичность: интервал" })
  @IsPositive()
  loop_interval: number;

  @Field(() => Boolean, { description: "Дни недели (понедельник)" })
  loop_week_1: boolean;

  @Field(() => Boolean, { description: "Дни недели (вторник)" })
  loop_week_2: boolean;

  @Field(() => Boolean, { description: "Дни недели (среда)" })
  loop_week_3: boolean;

  @Field(() => Boolean, { description: "Дни недели (четверг)" })
  loop_week_4: boolean;

  @Field(() => Boolean, { description: "Дни недели (пятница)" })
  loop_week_5: boolean;

  @Field(() => Boolean, { description: "Дни недели (суббота)" })
  loop_week_6: boolean;

  @Field(() => Boolean, { description: "Дни недели (воскресенье)" })
  loop_week_7: boolean;

  @Field(() => JobLoopMonthEnum, { description: "Повторы для месяца" })
  loop_month_type: JobLoopMonthEnum;

  // @Field(() => Boolean, { description: "Признак: периодичность установлена" })
  // done: boolean;
}

/**
 * SET
 */
@ArgsType()
export class JobLoopParamDtoSet extends IntersectionType(
  PickType(Base, ["job_id", "start_date", "loop_interval", "loop_kind"] as const),
  PartialType(OmitType(Base, ["job_id", "start_date", "loop_interval", "loop_kind"] as const)),
) {}

/**
 * RESPONSE: GetMonthVariantsResponse
 */
@ObjectType()
export class GetMonthVariantsResponse {
  @Field(() => JobLoopMonthEnum, { description: "Идентификатор варианта" })
  key: JobLoopMonthEnum;

  @Field(() => String, { description: "Отображаемый текст варианта" })
  title: string;
}
