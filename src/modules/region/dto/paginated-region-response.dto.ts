import { ObjectType } from "@nestjs/graphql";

import { RegionEntity } from "../../../entity/#organization/region/region.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedRegionResponse extends PaginatedResponse(RegionEntity) {}
