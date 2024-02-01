import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedSetting =
[
  {
    id: 900,
    name: 'Просмотр системных настроек',
    method: 'GetAllSetting',
    type: AUDIT_OPERATION_TYPE.SETTING.id,
    is_enabled: true,
  },
  {
    id: 901,
    name: 'Изменение системных настроек',
    method: 'updateSetting',
    type: AUDIT_OPERATION_TYPE.SETTING.id,
    is_enabled: true,
  },

];
