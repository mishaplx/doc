import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedReport =
[
  {
    id: 600,
    name: 'Скачивание файла отчета',
    method: 'downloadFileReport',
    type: AUDIT_OPERATION_TYPE.REPORT.id,
    is_enabled: true,
  },
  {
    id: 601,
    name: 'Загрузка файла отчета',
    method: 'uploadFileReport',
    type: AUDIT_OPERATION_TYPE.REPORT.id,
    is_enabled: true,
  },

  {
    id: 602,
    name: 'Получение списка отчетов',
    method: 'listReportTemplate',
    type: AUDIT_OPERATION_TYPE.REPORT.id,
    is_enabled: true,
  },
  {
    id: 603,
    name: 'Формирование отчета',
    method: 'reportStatCreate',
    type: AUDIT_OPERATION_TYPE.REPORT.id,
    is_enabled: true,
  },

];
