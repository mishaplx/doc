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

import { RlsAccessGroupEntity } from "../../../../entity/#organization/rls/rls.access.group.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedRlsAccessGroupResponse extends PaginatedResponse(RlsAccessGroupEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "RLS группа: id" })
  rls_group_id: number;

  @Field(() => Int, { description: "Проект: id" })
  project_id: number;

  @Field(() => Int, { description: "Документ: id" })
  doc_id: number;

  @Field(() => Int, { description: "Поручение: id" })
  job_id: number;

  @Field(() => Boolean, { description: "Признак: только чтение" })
  read_only: boolean;
}

@ArgsType()
export class RlsAccessGroupDtoList extends IntersectionType(
  PartialType(Base),
  PartialType(IdsDto),
) {}

@ArgsType()
export class RlsAccessGroupDtoGet extends PickType(Base, ["id"] as const) {}

@ArgsType()
export class RlsAccessGroupDtoCreate extends IntersectionType(
  PickType(Base, ["rls_group_id", "read_only"] as const),
  PartialType(OmitType(Base, ["id", "rls_group_id", "read_only"] as const)),
) {}

@ArgsType()
export class RlsAccessGroupDtoUpdate extends PickType(Base, ["id", "read_only"] as const) {}

@ArgsType()
export class RlsAccessGroupDtoDel extends PickType(Base, ["id"] as const) {}
