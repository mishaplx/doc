import { ObjectType } from "@nestjs/graphql";

import { UserEntity } from "../../entity/#organization/user/user.entity";
import { UserSessionEntity } from "../../entity/#organization/user/userSession.entity";
import { PaginatedResponse } from "../../pagination/pagination.service";

@ObjectType()
export class PaginatedUserForDbResponseDto extends PaginatedResponse(UserEntity) {}

@ObjectType()
export class PaginatedSessionResponseDto extends PaginatedResponse(UserSessionEntity) {}
