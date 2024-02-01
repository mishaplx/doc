import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedFind =
[
  {
    id: 700,
    name: 'Полнотекстовый поиск',
    method: 'fullTextSearch',
    type: AUDIT_OPERATION_TYPE.FIND.id,
    is_enabled: true,
  },
  {
    id: 701,
    name: 'Атрибутивный поиск по документам',
    method: 'attributiveJobSearch',
    type: AUDIT_OPERATION_TYPE.FIND.id,
    is_enabled: true,
  },
  {
    id: 702,
    name: 'Атрибутивный поиск по поручениям',
    method: 'fullTextSearch',
    type: AUDIT_OPERATION_TYPE.FIND.id,
    is_enabled: true,
  },
  {
    id: 703,
    name: 'Атрибутивный поиск по проектам',
    method: 'attributiveProjectSearch',
    type: AUDIT_OPERATION_TYPE.FIND.id,
    is_enabled: true,
  },

];
