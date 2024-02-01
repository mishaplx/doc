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

import { MaxLength } from "class-validator";

import { NumParamEntity } from "../../../../entity/#organization/num/numParam.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedNumParamResponse extends PaginatedResponse(NumParamEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => String, { description: "Наименование" })
  name: string;

  @Field(() => String, { description: "Метод для получения значения (max len: 32)" })
  @MaxLength(32)
  method_name: string;

  @Field(() => Int, { description: "Аргумент метода для получения значения" })
  @MaxLength(32)
  method_arg: string;

  @Field(() => String, { description: "Пример (max len: 10)" })
  @MaxLength(10)
  example: string;

  @Field(() => String, { description: "Примечание" })
  note: string;
}

@ArgsType()
export class NumParamDtoList extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}

@ArgsType()
export class NumParamDtoGet extends PickType(Base, ["id"] as const) {}

@ArgsType()
export class NumParamDtoCreate extends IntersectionType(
  PickType(Base, ["name", "method_name", "example"] as const),
  PartialType(OmitType(Base, ["id", "name", "method_name", "example"] as const)),
) {}

@ArgsType()
export class NumParamDtoUpdate extends IntersectionType(
  PickType(Base, ["id"] as const),
  PartialType(OmitType(Base, ["id"] as const)),
) {}

@ArgsType()
export class NumParamDtoDel extends PickType(Base, ["id"] as const) {}
