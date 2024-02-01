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

import { NumCountHistoryEntity } from "../../../../entity/#organization/num/numCountHistory.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedNumCountHistoryResponse extends PaginatedResponse(NumCountHistoryEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "Нумератор: id" })
  num_id: number;

  @Field(() => GraphQLISODateTime, { description: "Дата записи значения счетчика" })
  date: Date;

  @Field(() => Int, { description: "Значение счетчика" })
  val: number;

  @Field(() => Int, { description: "Количество неиспользованных зарезервированных номеров" })
  count_reserve: number;

  @Field(() => Boolean, { description: "Признак сброса счетчика после записи значения" })
  reset: boolean;
}

@ArgsType()
export class NumCountHistoryDtoList extends IntersectionType(
  PartialType(Base),
  PartialType(IdsDto),
) {}

@ArgsType()
export class NumCountHistoryDtoGet extends PickType(Base, ["id"] as const) {}

@ArgsType()
export class NumCountHistoryDtoCreate extends IntersectionType(
  PickType(Base, ["num_id", "val"] as const),
  PartialType(OmitType(Base, ["id", "num_id", "val"] as const)),
) {}

// отключено за ненадобностью
// @ArgsType()
// export class NumCountHistoryDtoUpdate extends IntersectionType(
//   PickType(Base, ['id'] as const),
//   PartialType(OmitType(Base, ['id'] as const))
// ) {}

@ArgsType()
export class NumCountHistoryDtoDel extends PickType(Base, ["id"] as const) {}
