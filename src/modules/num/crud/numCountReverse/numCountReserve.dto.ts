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
import { NumCountReserveEntity } from "../../../../entity/#organization/num/numCountReserve.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedNumCountReserveResponse extends PaginatedResponse(NumCountReserveEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "Нумератор: id" })
  num_id: number;

  @Field(() => Int, { description: "Кто зарезервировал: id" })
  emp_id: number;

  @Field(() => GraphQLISODateTime, { description: "Дата резервирования значения счетчика" })
  date: Date;

  @Field(() => Int, { description: "Резервируемое значение счетчика" })
  val: number;

  @Field(() => String, { description: "Примечание" })
  note: string;
}

/**
 * LIST
 */
@ArgsType()
export class NumCountReserveDtoList extends IntersectionType(
  PartialType(Base),
  PartialType(IdsDto),
) {}

/**
 * GET
 */
@ArgsType()
export class NumCountReserveDtoGet extends PickType(Base, ["id"] as const) {}

/**
 * CREATE
 */
@ArgsType()
export class NumCountReserveDtoCreate extends IntersectionType(
  PickType(Base, ["num_id", "val"] as const),
  PartialType(OmitType(Base, ["id", "num_id", "val"] as const)),
) {}

/**
 * UPDATE
 */
@ArgsType()
export class NumCountReserveDtoUpdate extends IntersectionType(
  PickType(Base, ["id"] as const),
  PartialType(PickType(Base, ["note"] as const)),
) {}

/**
 * DELETE
 */
@ArgsType()
export class NumCountReserveDtoDel extends PickType(Base, ["id"] as const) {}
