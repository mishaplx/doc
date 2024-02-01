import { PickType } from "@nestjs/graphql";
import { RoleOperationsEntity } from "../../../../../entity/#organization/role/roleOperation.entity";
import { operationSeed } from "./operation";

class RoleOperationSeed extends PickType(RoleOperationsEntity, [
  "id",
  "role_id",
  "operation_id",
] as const) {}

export const roleOperationSeed: RoleOperationSeed[] = [];
// for (const operationSeedItem of operationSeed) {
//   roleOperationSeed.push({
//     id: operationSeedItem.id,
//     role_id: 1,
//     operation_id: operationSeedItem.id,
//   });
// }
