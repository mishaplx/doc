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

import { OrderNumEnum, SortEnum } from "../../../../common/enum/enum";
import { NumEntity } from "../../../../entity/#organization/num/num.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedNumResponse extends PaginatedResponse(NumEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => String, { description: "Наименование нумератора" })
  name: string;

  @Field(() => [Int], { description: "Выбранные параметры: [id]" })
  num_param_ids: number[];

  @Field(() => [String], { description: "Выбранные параметры: [значения]" })
  num_param_values: string[];

  @Field(() => Int, { description: "Тип документа: id" })
  kdoc_id: number;

  @Field(() => [Int], { description: "Виды документов: [id]" })
  tdoc_ids: number[];

  @Field(() => [Int], { description: "Подразделения: [id]" })
  unit_ids: number[];

  @Field(() => Int, { description: "Счетчик: текущее значение" })
  count_val: number;

  @Field(() => GraphQLISODateTime, { description: "Счетчик: дата последнего обращения" })
  count_tick: Date;

  @Field(() => Boolean, { description: "Счетчик: признак ежегодного сброса" })
  count_reset_year: boolean;

  @Field(() => GraphQLISODateTime, { description: "Дата начала действия" })
  date_start: Date;

  @Field(() => GraphQLISODateTime, { description: "Дата завершения действия" })
  date_end: Date;

  @Field(() => String, { description: "Примечание" })
  note: string;
}

/**
 * LIST
 */
@ArgsType()
export class NumDtoList extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}

@ArgsType()
export class GetNumArgs {
  @Field({ nullable: true, description: "Образец" })
  num_param_sel?: string;

  @Field({ nullable: true, description: "Наименование нумератора" })
  name?: string;

  @Field(() => Int, { nullable: true, description: "Тип документа: id" })
  kdoc?: number;

  @Field(() => Int, { nullable: true, description: "Вид документа: id" })
  tdoc?: number;

  @Field({ nullable: true, description: "Дата начала" })
  date_start?: Date;

  @Field({ nullable: true, description: "Дата завершения" })
  date_end?: Date;

  @Field({ nullable: true, description: "Примечание" })
  note?: string;

  @Field(() => Int, { nullable: true, description: "Подразделения: id" })
  unit?: number;
}

@InputType()
export class OrderNumInput {
  @Field(() => SortEnum)
  sortEnum: SortEnum;

  @Field(() => OrderNumEnum)
  value: OrderNumEnum;
}

/**
 * GET
 */
@ArgsType()
export class NumDtoGet extends PickType(Base, ["id"] as const) {}

/**
 * CREATE
 */
@ArgsType()
export class NumDtoCreate extends IntersectionType(
  PickType(Base, ["name", "kdoc_id"] as const),
  PartialType(OmitType(Base, ["id", "name", "kdoc_id"] as const)),
) {}

/**
 * UPDATE
 */
@ArgsType()
export class NumDtoUpdate extends IntersectionType(
  PickType(Base, ["id"] as const),
  PartialType(OmitType(Base, ["id"] as const)),
) {}

/**
 * DELETE
 */
@ArgsType()
export class NumDtoDel extends PickType(Base, ["id"] as const) {}
