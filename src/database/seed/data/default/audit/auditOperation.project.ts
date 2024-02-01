import { AUDIT_OPERATION_TYPE } from "../../../../../modules/audit/const/audit.operationType.const";

export const auditOperationSeedProject =
[
  {
    id: 400,
    name: 'Получение списка проектов',
    method: 'getAllProjects',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 401,
    name: 'Просмотр проекта',
    method: 'getProjectsById',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 402,
    name: 'Создание проекта',
    method: 'createProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 403,
    name: 'Изменение проекта',
    method: 'updateProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 404,
    name: 'Удаление проекта',
    method: 'deleteProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 405,
    name: 'Отправка проекта по маршруту',
    method: 'sendToRoute',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 406,
    name: 'Закрытие проекта',
    method: 'closeProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 407,
    name: 'Согласование этапа проекта',
    method: 'stageWithConfirm',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },

  {
    id: 420,
    name: 'Скачивание файла проекта',
    method: 'downloadFileProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 421,
    name: 'Скачивание файла шаблона проекта',
    method: 'downloadFileProjectTemplate',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },

  {
    id: 430,
    name: 'Загрузка файла проекта',
    method: 'uploadFileProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 431,
    name: 'Загрузка файла шаблона проекта',
    method: 'uploadFileProjectTemplate',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },

  {
    id: 440,
    name: 'Удаление файла проекта',
    method: 'deleteFileProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 441,
    name: 'Удаление блока файлов проекта',
    method: 'deleteBlockFileProject',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },

  {
    id: 450,
    name: 'Загрузка файла проекта',
    method: '/upload/file/project',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 451,
    name: 'Возврат проекта на доработку',
    method: '/projects/revision',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },
  {
    id: 452,
    name: 'Согласование этапа проекта с замечаниями',
    method: '/projects/remark',
    type: AUDIT_OPERATION_TYPE.PROJECT.id,
    is_enabled: true,
  },

];
