import { ObjectType } from "@nestjs/graphql";
import { ForwardingEntity } from "../../../entity/#organization/forwarding/forwarding.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedForwardListResponse extends PaginatedResponse(ForwardingEntity) {}
