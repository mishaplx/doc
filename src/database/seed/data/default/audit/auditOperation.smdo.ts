import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedSmdo =
[
  {
    id: 1000,
    name: 'История отправки/Лог сообщений СМДО',
    method: 'smdoPackages',
    type: AUDIT_OPERATION_TYPE.SMDO.id,
    is_enabled: true,
  },
  {
    id: 1001,
    name: 'Отказ в регистрации',
    method: 'smdoRegisterReject',
    type: AUDIT_OPERATION_TYPE.SMDO.id,
    is_enabled: true,
  },
  {
    id: 1002,
    name: 'Не подлежит регистрации',
    method: 'smdoDecline',
    type: AUDIT_OPERATION_TYPE.SMDO.id,
    is_enabled: true,
  },
];
