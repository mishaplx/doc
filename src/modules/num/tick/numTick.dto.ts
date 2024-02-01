import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  InputType,
  Int,
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from "@nestjs/graphql";
import { IdsDto } from "../../../pagination/paginationDTO";

@ArgsType()
@InputType()
class Base {
  @Field(() => Int, { description: "id записи" })
  id: number;

  @Field(() => String, { description: "Наименование" })
  name: string;

  @Field(() => GraphQLISODateTime, { description: "Дата последнего обращения" })
  count_tick: Date;

  @Field(() => Int, { description: "Текущее значение" })
  val: number;

  @Field(() => Boolean, { description: "Признак: сброс ежегодный" })
  count_reset_year: boolean;

  @Field(() => String, { description: "Примечание" })
  note: string;
}

/**
 * TAKE
 */
@ArgsType()
export class NumTickDtoTake extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}
