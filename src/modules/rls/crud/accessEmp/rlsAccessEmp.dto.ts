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

import { RlsAccessEmpEntity } from "../../../../entity/#organization/rls/rls.access.emp.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
import { IdsDto } from "../../../../pagination/paginationDTO";

@ObjectType()
export class PaginatedRlsAccessEmpResponse extends PaginatedResponse(RlsAccessEmpEntity) {}

@ArgsType()
@InputType()
class Base {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { description: "Назначение: id" })
  emp_id: number;

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
export class RlsAccessEmpDtoList extends IntersectionType(PartialType(Base), PartialType(IdsDto)) {}

@ArgsType()
export class RlsAccessEmpDtoGet extends PickType(Base, ["id"] as const) {}

@ArgsType()
export class RlsAccessEmpDtoCreate extends IntersectionType(
  PickType(Base, ["emp_id", "read_only"] as const),
  PartialType(OmitType(Base, ["id", "emp_id", "read_only"] as const)),
) {}

@ArgsType()
export class RlsAccessEmpDtoUpdate extends PickType(Base, ["id", "read_only"] as const) {}

@ArgsType()
export class RlsAccessEmpDtoDel extends PickType(Base, ["id"] as const) {}
