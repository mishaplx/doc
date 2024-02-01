import { ObjectType } from "@nestjs/graphql";

import { StaffEntity } from "../../../entity/#organization/staff/staff.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedStaffResponse extends PaginatedResponse(StaffEntity) {}
