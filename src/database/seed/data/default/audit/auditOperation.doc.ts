import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedDoc =
[
  {
    id: 300,
    name: 'Получение списка документов',
    method: 'getAllDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 301,
    name: 'Получение определенного документа',
    method: 'findByIdDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 302,
    name: 'Направить документ в дело',
    method: 'sendDocToDocPackage',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 303,
    name: 'Сохранение документа',
    method: 'deleteDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 304,
    name: 'Регистрация документа',
    method: 'registerDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 305,
    name: 'Отправка документа по почте',
    method: 'sendMail',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },

  {
    id: 350,
    name: 'Получение всех файлов относящихся к документу',
    method: 'getAllFileForDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 360,
    name: 'Скачивание файла документа',
    method: 'downloadFileDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 361,
    name: 'Загрузка файла документа',
    method: 'uploadFileDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 362,
    name: 'Удаление файла документа',
    method: 'deleteFileDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },
  {
    id: 363,
    name: 'Удаление блока файлов документа',
    method: 'deleteBlockFileDoc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },

  {
    id: 370,
    name: 'Скачивание РКК документа',
    method: '/report/doc',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },

  {
    id: 380,
    name: 'Отправка документа по СМДО',
    method: '/smdo/create-package-and-send',
    type: AUDIT_OPERATION_TYPE.DOC.id,
    is_enabled: true,
  },

];
