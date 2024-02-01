import { ObjectType } from "@nestjs/graphql";
import { DeliveryEntity } from "../../../entity/#organization/delivery/delivery.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedDeliveryResponse extends PaginatedResponse(DeliveryEntity) {}
