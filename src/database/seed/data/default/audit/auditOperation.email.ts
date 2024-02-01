import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedEmail =
[
  {
    id: 800,
    name: 'Получение всех файлов относящихся к документу почтового импорта',
    method: 'getAllFileForDocByIncmail',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },

  {
    id: 801,
    name: 'Импорт писем',
    method: 'importIncmail',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },
  {
    id: 802,
    name: 'Удаление писем',
    method: 'incmailDelete',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },
  {
    id: 803,
    name: 'Получение списка писем',
    method: 'getAllIncmail',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },
  {
    id: 804,
    name: 'Просмотр письма',
    method: 'getIncmailById',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },

  {
    id: 805,
    name: 'Скачивание файла письма',
    method: 'downloadFileMail',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },

  {
    id: 806,
    name: 'Загрузка файла письма',
    method: 'uploadFileMail',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },

  {
    id: 807,
    name: 'Удаление файла письма',
    method: 'deleteFileMail',
    type: AUDIT_OPERATION_TYPE.EMAIL.id,
    is_enabled: true,
  },

];
