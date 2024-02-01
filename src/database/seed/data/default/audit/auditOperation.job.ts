import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedJob =
[
  {
    id: 500,
    name: 'Получение списка поручений',
    method: 'getAllJobs',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 501,
    name: 'Просмотр поручения',
    method: 'getJobsById',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 502,
    name: 'Создание/Изменение поручения',
    method: 'updateJob',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 503,
    name: 'Отправка поручения на утверждение',
    method: 'sendForApprove',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 504,
    name: 'Утверждение поручения',
    method: 'askForApprove',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 505,
    name: 'Возврат поручения на доработку',
    method: 'reworkForApprove',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 506,
    name: 'Отправка поручения на исполнение',
    method: 'sendToExecution',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 507,
    name: 'Создание отчета по поручению',
    method: 'createReport',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 508,
    name: 'Возврат поручения на исполнение',
    method: 'returnToExecJobControl',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 509,
    name: 'Снятие поручение с контроля',
    method: 'getOutOfControl',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },

  {
    id: 550,
    name: 'Скачивание файла поручения',
    method: 'downloadFileJob',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 551,
    name: 'Загрузка файла поручения',
    method: 'uploadFileJob',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 552,
    name: 'Удаление файла поручения',
    method: 'deleteFileJob',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 553,
    name: 'Удаление блока файлов поручения',
    method: 'deleteBlockFileJob',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },

  {
    id: 554,
    name: 'Загрузка файла поручения',
    method: '/upload/file/job',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },
  {
    id: 560,
    name: 'Скачивание РКК поручения',
    method: '/report/job',
    type: AUDIT_OPERATION_TYPE.JOB.id,
    is_enabled: true,
  },

];