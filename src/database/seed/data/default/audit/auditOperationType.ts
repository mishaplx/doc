import { PickType } from "@nestjs/graphql";

import { AuditOperationTypeEntity } from "../../../../../entity/#organization/audit/audit-operation-type.entity";
import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

class AuditOperationTypeSeedKeys extends PickType(AuditOperationTypeEntity, [
  "id",
  "name",
] as const) {}


export const auditOperationTypeSeed: AuditOperationTypeSeedKeys[] =
[
  {
    id: AUDIT_OPERATION_TYPE.AUTH.id,
    name: AUDIT_OPERATION_TYPE.AUTH.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.AUDIT.id,
    name: AUDIT_OPERATION_TYPE.AUDIT.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.PACK.id,
    name: AUDIT_OPERATION_TYPE.PACK.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.DOC.id,
    name: AUDIT_OPERATION_TYPE.DOC.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.PROJECT.id,
    name: AUDIT_OPERATION_TYPE.PROJECT.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.JOB.id,
    name: AUDIT_OPERATION_TYPE.JOB.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.REPORT.id,
    name: AUDIT_OPERATION_TYPE.REPORT.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.FIND.id,
    name: AUDIT_OPERATION_TYPE.FIND.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.EMAIL.id,
    name: AUDIT_OPERATION_TYPE.EMAIL.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.SETTING.id,
    name: AUDIT_OPERATION_TYPE.SETTING.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.SMDO.id,
    name: AUDIT_OPERATION_TYPE.SMDO.nm,
  },
  {
    id: AUDIT_OPERATION_TYPE.CATALOG.id,
    name: AUDIT_OPERATION_TYPE.CATALOG.nm,
  },
];
