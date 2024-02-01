import {
  ArgsType,
  Field,
  InputType,
  Int,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType,
} from "@nestjs/graphql";

import { SortEnum } from "../../../../common/enum/enum";
import { NotifyTypeEntity } from "../../../../entity/#organization/notify/notifyType.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedNotifyTypeResponse extends PaginatedResponse(NotifyTypeEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "Группа типа сообщения" })
  notify_type_group_id: number;

  @Field(() => String, { description: "Наименование" })
  name: string;

  // Подписку делать со стороны Emp
  // @Field(() => [Int], { description: "Подписка - назначения: [id]" })
  // emp_ids: number[];
}

/**
 * LIST
 */
@ArgsType()
export class NotifyTypeDtoList extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}

/**
 * GET
 */
@ArgsType()
export class NotifyTypeDtoGet extends PickType(Base, ["id"] as const) {}

/**
 * CREATE
 */
@ArgsType()
export class NotifyTypeDtoCreate extends IntersectionType(
  PickType(Base, ["notify_type_group_id", "name"] as const),
  PartialType(OmitType(Base, ["id", "notify_type_group_id", "name"] as const)),
) {}

/**
 * UPDATE
 */
@ArgsType()
export class NotifyTypeDtoUpdate extends IntersectionType(
  PickType(Base, ["id"] as const),
  PartialType(OmitType(Base, ["id"] as const)),
) {}

/**
 * DELETE
 */
@ArgsType()
export class NotifyTypeDtoDel extends PickType(Base, ["id"] as const) {}

/**
 * СОРТИРОВКА
 */
@InputType()
export class OrderNotifyTypeInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderNotifyTypeEnum)
  value: OrderNotifyTypeEnum;
}

/** Поля сортировки грида "Типы уведомлений" */
export enum OrderNotifyTypeEnum {
  /** id */
  id = 1,
  /** Группа типа сообщения */
  notify_type_group_id = 2,
  /** Наименование */
  name = 3,
}

/** Зарегистрировать OrderNotifyTypeEnum */
registerEnumType(OrderNotifyTypeEnum, {
  name: "OrderNotifyTypeEnum",
  description: 'Поля сортировки грида "Типы уведомлений"',
  valuesMap: {
    notify_type_group_id: {
      description: "Группа типа сообщения",
    },
    name: {
      description: "Наименование",
    },
  },
});
