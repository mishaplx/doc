import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "../../../pagination/pagination.service";
import { ActResponse } from "./get-act-response.dto";

@ObjectType()
export class PaginatedActResponse extends PaginatedResponse(ActResponse) {}
