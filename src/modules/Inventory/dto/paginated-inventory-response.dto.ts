import { ObjectType } from "@nestjs/graphql";
import { PaginatedResponse } from "../../../pagination/pagination.service";
import { InventoryResponse } from "./get-inventory-response.dto";

@ObjectType()
export class PaginatedInventoryResponse extends PaginatedResponse(InventoryResponse) {}
