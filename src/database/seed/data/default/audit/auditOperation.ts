import { PickType } from "@nestjs/graphql";

import { AuditOperationsEntity } from "../../../../../entity/#organization/audit/audit-operations.entity";
import { auditOperationSeedAuth } from "./auditOperation.auth";
import { auditOperationSeedProject } from "./auditOperation.project";
import { auditOperationSeedDoc } from "./auditOperation.doc";
import { auditOperationSeedJob } from "./auditOperation.job";
import { auditOperationSeedPack } from "./auditOperation.pack";
import { auditOperationSeedReport } from "./auditOperation.report";
import { auditOperationSeedCatalog } from "./auditOperation.catalog";
import { auditOperationSeedAudit } from "./auditOperation.audit";
import { auditOperationSeedEmail } from "./auditOperation.email";
import { auditOperationSeedFind } from "./auditOperation.find";
import { auditOperationSeedSmdo } from "./auditOperation.smdo";
import { auditOperationSeedSetting } from "./auditOperation.setting";

class AuditOperationSeedKeys extends PickType(AuditOperationsEntity, [
  "id",
  "name",
  "method",
  "type",
  "is_enabled",
] as const) {}


export const auditOperationSeed: AuditOperationSeedKeys[] =
[
  ...auditOperationSeedAuth,
  ...auditOperationSeedProject,
  ...auditOperationSeedDoc,
  ...auditOperationSeedJob,
  ...auditOperationSeedPack,
  ...auditOperationSeedReport,
  ...auditOperationSeedCatalog,
  ...auditOperationSeedAudit,
  ...auditOperationSeedEmail,
  ...auditOperationSeedFind,
  ...auditOperationSeedSmdo,
  ...auditOperationSeedSetting,
];
