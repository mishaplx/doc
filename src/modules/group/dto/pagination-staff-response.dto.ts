import { ObjectType } from "@nestjs/graphql";
import { EmpEntity } from "../../../entity/#organization/emp/emp.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedStaffResponse extends PaginatedResponse(EmpEntity) {}
