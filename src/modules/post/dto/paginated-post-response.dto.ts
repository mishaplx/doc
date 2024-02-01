import { ObjectType } from "@nestjs/graphql";
import { PostEntity } from "../../../entity/#organization/post/post.entity";
import { PaginatedResponse } from "../../../pagination/pagination.service";

@ObjectType()
export class PaginatedPostResponse extends PaginatedResponse(PostEntity) {}
