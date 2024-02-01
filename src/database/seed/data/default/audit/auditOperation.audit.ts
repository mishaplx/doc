import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedAudit =
[
  {
    id: 100,
    name: 'Просмотр журнала аудита',
    method: 'getAudit',
    type: AUDIT_OPERATION_TYPE.AUDIT.id,
    is_enabled: true,
  },
  {
    id: 101,
    name: 'Очистка журнала аудита',
    method: 'clearAudit',
    type: AUDIT_OPERATION_TYPE.AUDIT.id,
    is_enabled: true,
  },

  {
    id: 102,
    name: 'Проверка целостности журнала аудита',
    method: '/audit/hash',
    type: AUDIT_OPERATION_TYPE.AUDIT.id,
    is_enabled: true,
  },
  {
    id: 103,
    name: 'Выгрузка журнала аудита',
    method: '/audit/download/file',
    type: AUDIT_OPERATION_TYPE.AUDIT.id,
    is_enabled: true,
  },

];
