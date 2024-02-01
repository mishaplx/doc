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
} from "@nestjs/graphql";

import { RlsGroupEntity } from "../../../../entity/#organization/rls/rls.group.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedRlsGroupResponse extends PaginatedResponse(RlsGroupEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => String, { description: "Название RLS группы" })
  name: string;

  @Field(() => String, { description: "Примечание" })
  note: string;

  @Field(() => [Int], { description: "Назначения: ids" })
  emp_ids: number[];
}

@ArgsType()
export class RlsGroupDtoList extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}

@ArgsType()
export class RlsGroupDtoGet extends PickType(Base, ["id"] as const) {}

@ArgsType()
export class RlsGroupDtoCreate extends IntersectionType(
  PickType(Base, ["name"] as const),
  PartialType(OmitType(Base, ["id", "name"] as const)),
) {}

@ArgsType()
export class RlsGroupDtoUpdate extends IntersectionType(
  PickType(Base, ["id"] as const),
  PartialType(OmitType(Base, ["id"] as const)),
) {}

@ArgsType()
export class RlsGroupDtoDel extends PickType(Base, ["id"] as const) {}
