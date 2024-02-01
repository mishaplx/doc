import { ObjectType } from "@nestjs/graphql";

import { CitizenEntity } from "../../../entity/#organization/citizen/citizen.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedCitizenResponse extends PaginatedResponse(CitizenEntity) {}
