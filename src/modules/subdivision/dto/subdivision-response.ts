import { ObjectType } from "@nestjs/graphql";
import { DeliveryEntity } from "../../../entity/#organization/delivery/delivery.entity";
import { UnitEntity } from "../../../entity/#organization/unit/unit.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedUnitResponse extends PaginatedResponse(UnitEntity) {}
