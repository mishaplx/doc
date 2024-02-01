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
  registerEnumType,
} from "@nestjs/graphql";
import { PsBaseEnum } from "../../../../BACK_SYNC_FRONT/enum/enum.pubsub";
import { SortEnum } from "../../../../common/enum/enum";
import { NotifyEntity } from "../../../../entity/#organization/notify/notify.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedNotifyResponse extends PaginatedResponse(NotifyEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => String, { description: "Сообщение" })
  message: string;

  @Field(() => String, { description: "Вид сообщения (инфо, ошибка, предупреждение, ок)" })
  kind: PsBaseEnum;

  @Field(() => Int, { description: "Тип сообщения: id" })
  notify_type_id: number;

  @Field(() => Int, { description: "Назначение: id" })
  emp_id: number;

  @Field(() => [Int], { description: "Назначение: список id" })
  emp_ids: number[];

  @Field(() => Int, { description: "Проект: id" })
  project_id: number;

  @Field(() => Int, { description: "Документ: id" })
  doc_id: number;

  @Field(() => Int, { description: "Поручение: id" })
  job_id: number;

  // @Field(() => Int, { description: "Отчет: id" })
  // report_id: number;

  @Field(() => GraphQLISODateTime, { description: "Дата создания" })
  date_create: Date;

  @Field(() => GraphQLISODateTime, { description: "Дата контроля" })
  date_control: Date;

  @Field(() => GraphQLISODateTime, { description: "Дата просмотра" })
  date_view: Date;
}

/**
 * INFO
 */
@ObjectType()
export class NotifyDtoInfo {
  @Field(() => [NotifyEntity], {
    description: "Последние уведомления: сначала непрочитанные, потом прочитанные",
  })
  data: NotifyEntity[];

  @Field(() => Int, { description: "Количество непрочитанных уведомлений" })
  count: number;
}

/**
 * LIST
 */
@ArgsType()
export class NotifyDtoList extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}

/**
 * GET
 */
@ArgsType()
export class NotifyDtoGet extends PickType(Base, ["id"] as const) {}

/**
 * CREATE
 */
@ArgsType()
export class NotifyDtoCreate extends IntersectionType(
  PickType(Base, ["notify_type_id", "emp_id", "message", "kind"] as const),
  PartialType(OmitType(Base, ["id", "notify_type_id", "emp_id", "message", "kind"] as const)),
) {}

/**
 * ADD (для addNotify)
 */
@ArgsType()
export class NotifyDtoAdd extends IntersectionType(
  PickType(Base, ["notify_type_id", "message"] as const),
  PartialType(
    OmitType(Base, ["id", "notify_type_id", "emp_id", "message", "date_create"] as const),
  ),
) {
  @Field(() => [Int], { description: "Назначение: список id" })
  emp_ids: number[];
}

/**
 * UPDATE
 */
@ArgsType()
// export class NotifyDtoUpdate extends PickType(Base, ["date_view"] as const) {}
export class NotifyDtoUpdate extends IntersectionType(
  PickType(IdsDto, ["ids"] as const),
  PartialType(PickType(Base, ["date_view"] as const)),
) {}

/**
 * DELETE
 */
@ArgsType()
export class NotifyDtoDel extends PickType(IdsDto, ["ids"] as const) {}

/**
 * СОРТИРОВКА
 */
@InputType()
export class OrderNotifyInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderNotifyEnum)
  value: OrderNotifyEnum;
}

/** Поля сортировки грида "Уведомления" */
export enum OrderNotifyEnum {
  /** Сообщение */
  message = 1,
  /** Вид сообщения (инфо, ошибка, предупреждение, ок) */
  kind = 2,
  /** Тип сообщения */
  notify_type_id = 3,
  /** Проект: id */
  project_id = 4,
  /** Документ: id */
  doc_id = 5,
  /** Поручение: id */
  job_id = 6,
  /** Дата создания */
  date_create = 7,
  /** Дата контроля */
  date_control = 8,
  /** Дата просмотра */
  date_view = 9,
  // RLS выдает только один emp_id
  // /** Назначение: id */
  // emp_id = 10,
}

/** Зарегистрировать OrderNotifyEnum */
registerEnumType(OrderNotifyEnum, {
  name: "OrderNotifyEnum",
  description: 'Поля сортировки грида "Уведомления"',
  valuesMap: {
    message: {
      description: "Сообщение",
    },
    kind: {
      description: "Вид сообщения (инфо, ошибка, предупреждение, ок)",
    },
    notify_type_id: {
      description: "Тип сообщения",
    },
    project_id: {
      description: "Проект: id",
    },
    doc_id: {
      description: "Документ: id",
    },
    job_id: {
      description: "Поручение: id",
    },
    date_create: {
      description: "Дата создания",
    },
    date_control: {
      description: "Дата контроля",
    },
    date_view: {
      description: "Дата просмотра",
    },
    // emp_id: {
    //   description: "Назначение: id",
    // },
  },
});
