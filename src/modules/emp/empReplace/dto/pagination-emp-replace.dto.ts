import { ObjectType } from "@nestjs/graphql";

import { EmpReplaceEntity } from "../../../../entity/#organization/emp_replace/emp_replace.entity";
import { PaginatedResponse } from "../../../../pagination/pagination.service";
// @ObjectType({ isAbstract: true })
// class OmitEmpReplaceEntity extends PartialType(
//   OmitType(EmpReplaceEntity, ['post_who', 'post_whom'] as const),
//   ObjectType,
// ) {}
@ObjectType()
export class PaginationEmpReplaceDto extends PaginatedResponse(EmpReplaceEntity) {}
//export class PaginationEmpReplaceDto extends PaginatedResponse(OmitEmpReplaceEntity) {}
