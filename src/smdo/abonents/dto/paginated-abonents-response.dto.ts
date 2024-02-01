import { ObjectType } from "@nestjs/graphql";
import { SmdoAbonentsEntity } from "../../../entity/#organization/smdo/smdo_abonents.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedAbonentsResponse extends PaginatedResponse(SmdoAbonentsEntity) {}
