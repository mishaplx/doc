import { ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { InventoryEntity } from "../../../entity/#organization/inventory/inventory.entity";

@ObjectType()
export class InventoryResponse extends PartialType(
  PickType(InventoryEntity, [
    "FileBlock",
    "id",
    "number",
    "Name",
    "year",
    "description",
    "count_doc_package",
    "Status",
  ] as const),
) {}
