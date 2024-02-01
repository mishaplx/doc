import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedAuth =
[
  {
    id: 50,
    name: 'Выход из системы',
    method: 'logOut',
    type: AUDIT_OPERATION_TYPE.AUTH.id,
    is_enabled: true,
  },
  {
    id: 51,
    name: 'Вход в систему',
    method: 'SignIn',
    type: AUDIT_OPERATION_TYPE.AUTH.id,
    is_enabled: true,
  },
  {
    id: 52,
    name: 'Смена пароля',
    method: 'changePasswordFromOld',
    type: AUDIT_OPERATION_TYPE.AUTH.id,
    is_enabled: true,
  },
  {
    id: 53,
    name: 'Смена пароля в справочнике',
    method: 'changePassword',
    type: AUDIT_OPERATION_TYPE.AUTH.id,
    is_enabled: true,
  },
  {
    id: 54,
    name: 'Смена номера телефона',
    method: 'changePhoneNumber',
    type: AUDIT_OPERATION_TYPE.AUTH.id,
    is_enabled: true,
  },

];
