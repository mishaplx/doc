import { PickType } from "@nestjs/graphql";

import { OperationEntity } from "../../../../../entity/#organization/role/operation.entity";
import { OPERATION_MENU } from "../../../../../modules/operation/const/operation.menu.const";

class OperationSeed extends PickType(OperationEntity, [
  "id",
  "del",
  "function_name",
  "name",
  "menu_options_id",
] as const) {}

export const operationSeed: OperationSeed[] = [
  {
    id: 1,
    function_name: "GetAllInputDoc",
    name: "Просмотреть список документов",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 2,
    function_name: "CreateInputDoc",
    name: "Добавить документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 3,
    function_name: "findByIdDocInputDoc",
    name: "Просмотреть документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 4,
    function_name: "EditInputDoc",
    name: "Редактировать документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 5,
    function_name: "DeleteInputDoc",
    name: "Удалить документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 6,
    function_name: "DownloadInputDoc",
    name: "Скачать документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 7,
    function_name: "SaveInputDoc",
    name: "Сохранить документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 8,
    function_name: "RegistrateInputDoc",
    name: "Зарегистрировать документ",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 9,
    function_name: "getAllForwardingList",
    name: "Просмотреть список пересылки",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 10,
    function_name: "AddReceiverInputDoc",
    name: "Добавить пересылку",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 11,
    function_name: "deleteForwarding",
    name: "Удалить пересылку",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 12,
    function_name: "closeForwarding",
    name: "Закрыть пересылку",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 13,
    function_name: "getAllFileForDocInput",
    name: "Просмотреть список файлов",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 14,
    function_name: "UploadFileinInputDoc",
    name: "Добавить файл",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 15,
    function_name: "DeleteFileInputDoc",
    name: "Удалить файл",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 16,
    function_name: "DownloadFileinInputDoc",
    name: "Скачать файл",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 17,
    function_name: "SignInputDocFile",
    name: "Подписать файл",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 18,
    function_name: "getDocRel",
    name: "Просмотреть список связок",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 19,
    function_name: "createRel",
    name: "Добавить связку",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 20,
    function_name: "updateRel",
    name: "Редактировать связку",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 21,
    function_name: "deleteRel",
    name: "Удалить связку",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 22,
    function_name: "getAllJobsInInputDoc",
    name: "Просмотреть список поручений",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },

  // -----

  {
    id: 28,
    function_name: "GetAllOutputDoc",
    name: "Просмотр списка документов",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 29,
    function_name: "CreateOutputDoc",
    name: "Добавить документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 30,
    function_name: "findByIdDocutputDoc",
    name: "Просмотреть документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 31,
    function_name: "EditOutputDoc",
    name: "Редактировать документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 32,
    function_name: "DeleteOutputDoc",
    name: "Удалить документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 33,
    function_name: "DownloadOutputDoc",
    name: "Скачать документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 34,
    function_name: "SaveOutputDoc",
    name: "Сохранить документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 35,
    function_name: "RegistrateOutputDoc",
    name: "Зарегистрировать документ",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 36,
    function_name: "getCorrespondentsByDoc",
    name: "Просмотреть список корреспондентов",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 37,
    function_name: "addCorrespondent",
    name: "Добавить корреспондента",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 38,
    function_name: "deleteCorrespondent",
    name: "Удалить корреспондента",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 39,
    function_name: "getAllFileForDocOut",
    name: "Просмотреть список файлов",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 40,
    function_name: "UploadFileinOutputDoc",
    name: "Добавить файл",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 41,
    function_name: "SignOutPutDocFile",
    name: "Подписать файл",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 42,
    function_name: "DeleteFileOutputDoc",
    name: "Удалить файл",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 43,
    function_name: "DownloadFileinOutputDoc",
    name: "Скачать файл",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 44,
    function_name: "getDocRel",
    name: "Просмотреть список связок",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 45,
    function_name: "createRel",
    name: "Добавить связку",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 46,
    function_name: "updateRel",
    name: "Редактировать связку",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 47,
    function_name: "deleteRel",
    name: "Удалить связку",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 48,
    function_name: "GetAllInnerDoc",
    name: "Просмотр списка документов",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 49,
    function_name: "CreateInnerDoc",
    name: "Добавить документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 50,
    function_name: "findByIdDocInnerDoc",
    name: "Просмотреть документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 51,
    function_name: "EditInnerDoc",
    name: "Редактировать документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 52,
    function_name: "DeleteInnerDoc",
    name: "Удалить документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 53,
    function_name: "DownloadInnerDoc",
    name: "Скачать документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 54,
    function_name: "SaveInnerDoc",
    name: "Сохранить документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 55,
    function_name: "RegistrateInnerDoc",
    name: "Зарегистрировать документ",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 56,
    function_name: "getAllForwardingList",
    name: "Просмотреть список пересылки",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 57,
    function_name: "AddReceiverInnerDoc",
    name: "Добавить пересылку",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 58,
    function_name: "deleteForwarding",
    name: "Удалить пересылку",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 59,
    function_name: "closeForwarding",
    name: "Закрыть пересылку",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 60,
    function_name: "getAllFileForDocInner",
    name: "Просмотреть список файлов",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 61,
    function_name: "UploadFileinInnerDoc",
    name: "Добавить файл",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 62,
    function_name: "DeleteFileInnerDoc",
    name: "Удалить файл",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 63,
    function_name: "SignInnerDocFile",
    name: "Подписать файл",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 64,
    function_name: "DownloadFileinInnerDoc",
    name: "Скачать файл",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 65,
    function_name: "getDocRel",
    name: "Просмотреть список связок",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 66,
    function_name: "createRel",
    name: "Добавить связку",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 67,
    function_name: "updateRel",
    name: "Редактировать связку",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 68,
    function_name: "deleteRel",
    name: "Удалить связку",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 69,
    function_name: "getAllJobsInInnerDoc",
    name: "Просмотреть список поручений",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },

  // -----

  {
    id: 71,
    function_name: "getJobsById",
    name: "Просмотреть поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },

  // -----

  {
    id: 75,
    function_name: "getAllJobs",
    name: "Просмотр списка поручений",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 76,
    function_name: "createJob",
    name: "Добавить поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 77,
    function_name: "createChildrenJob",
    name: "Добавить Подпоручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 81,
    function_name: "updateJob",
    name: "Редактировать поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 82,
    function_name: "deleteJobs",
    name: "Удалить поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },

  {
    id: 86,
    function_name: "addExecutor",
    name: "Добавить исполнителя",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 87,
    function_name: "updateExecutor",
    name: "Произвести действия над исполнителем",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 88,
    function_name: "getReportsByJob",
    name: "Просмотреть историю отчетов",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 91,
    function_name: "jobControls",
    name: "Просмотреть список контролеров",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 92,
    function_name: "createJobControl",
    name: "Добавить контролера",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 93,
    function_name: "updateJobControl",
    name: "Редактировать контроль",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 94,
    function_name: "deleteJobControl",
    name: "Удалить контроль",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 95,
    function_name: "returnToExecJobControl",
    name: "Вернуть на исполнение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 96,
    function_name: "prolongTheJob",
    name: "Продлить срок",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 97,
    function_name: "refusalToRenew",
    name: "Отказать в продлении срока",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 98,
    function_name: "setForControlBefore",
    name: "Снять с предконтроля",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 99,
    function_name: "getOutOfControl",
    name: "Снять с контроля",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 100,
    function_name: "getFileByJob",
    name: "Просмотреть список файлов",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 101,
    function_name: "UploadFileinInJob",
    name: "Добавить файл",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 102,
    function_name: "DownloadFileJob",
    name: "Скачать файл",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  // {
  //   id: 103,
  //   function_name: "",
  //   name: "Подписать файл",
  //   menu_options_id: OPERATION_MENU.JOB.id,
  //   del: false,
  // },
  // {
  //   id: 104,
  //   function_name: "deleteFileFromJob",
  //   name: "Удалить файл",
  //   menu_options_id: OPERATION_MENU.JOB.id,
  //   del: false,
  // },
  {
    id: 105,
    function_name: "sendForApprove",
    name: "Отправить на утверждение поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 106,
    function_name: "askForApprove",
    name: "Утвердить поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 107,
    function_name: "reworkForApprove",
    name: "Отправить на доработку поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 108,
    function_name: "sendToExecution",
    name: "Отправить на исполнение поручение",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 109,
    function_name: "createReport",
    name: "Создать отчет об исполнении поручения",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 110,
    function_name: "askForProlong",
    name: "Запросить продление срока по поручению",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  // {
  //   id: 113,
  //   function_name: "",
  //   name: "Проверить ЭЦП поручения",
  //   menu_options_id: OPERATION_MENU.JOB.id,
  //   del: false,
  // },
  {
    id: 114,
    function_name: "getAllProjects",
    name: "Просмотреть список проектов",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 115,
    function_name: "createProject",
    name: "Добавить проект",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 116,
    function_name: "getProjectsById",
    name: "Просмотреть проект",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 117,
    function_name: "updateProject",
    name: "Редактировать проект",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 118,
    function_name: "deleteProject",
    name: "Удалить проект",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 122,
    function_name: "saveProject",
    name: "Сохранить проект",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 123,
    function_name: "getAllAction",
    name: "Добавить маршрут",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 124,
    function_name: "sendToRoute",
    name: "Отправить по маршруту",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 125,
    function_name: "ListVisa",
    name: "Просмотреть список визирования",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 126,
    function_name: "stageWithConfirm",
    name: "Визировать",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },

  // -----

  {
    id: 132,
    function_name: "ListSign",
    name: "Просмотреть список подписания",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 133,
    function_name: "ListConfirm",
    name: "Просмотреть список утверждения",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 134,
    function_name: "getAllFileForProject",
    name: "Просмотреть список файлов",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 135,
    function_name: "UploadFileinInProject",
    name: "Добавить файл",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 136,
    function_name: "DownloadFileInProject",
    name: "Скачать файл",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  // {
  //   id: 139,
  //   function_name: "renameFile",
  //   name: "Переименовать файл",
  //   menu_options_id: OPERATION_MENU.PROJECT.id,
  //   del: false,
  // },
  // {
  //   id: 140,
  //   function_name: "changeFileISMain",
  //   name: "Сделать файл необязательным",
  //   menu_options_id: OPERATION_MENU.PROJECT.id,
  //   del: false,
  // },
  // {
  //   id: 142,
  //   function_name: "deleteFileFromProject",
  //   name: "Удалить файл",
  //   menu_options_id: OPERATION_MENU.PROJECT.id,
  //   del: false,
  // },

  // -----

  {
    id: 148,
    function_name: "SingUp",
    name: "Добавить запись (справочник: пользователи)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 149,
    function_name: "updateUser",
    name: "Редактировать запись (справочник: пользователи)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 150,
    function_name: "SignList",
    name: "Просмотреть запись (справочник: пользователи)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 151,
    function_name: "deactivatedUser",
    name: "Активировать / Деактивировать пользователя (справочник: пользователи)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 153,
    function_name: "changePassword",
    name: "Сменить пароль",
    menu_options_id: OPERATION_MENU.REGISTER.id,
    del: false,
  },
  {
    id: 156,
    function_name: "GetAllSetting",
    name: "Просмотреть список настроек",
    menu_options_id: OPERATION_MENU.SETTING.id,
    del: false,
  },
  {
    id: 157,
    function_name: "updateSetting",
    name: "Редактировать настройки",
    menu_options_id: OPERATION_MENU.SETTING.id,
    del: false,
  },
  {
    id: 158,
    function_name: "getAudit",
    name: "Просмотреть журнал аудита",
    menu_options_id: OPERATION_MENU.AUDIT.id,
    del: false,
  },
  {
    id: 159,
    function_name: "getAllIncmail",
    name: "Просмотреть список почты",
    menu_options_id: OPERATION_MENU.EMAIL_IMPORT.id,
    del: false,
  },
  {
    id: 160,
    function_name: "importIncmail",
    name: "Принять сообщение",
    menu_options_id: OPERATION_MENU.EMAIL_IMPORT.id,
    del: false,
  },
  {
    id: 161,
    function_name: "updmail",
    name: "Обновить ",
    menu_options_id: OPERATION_MENU.EMAIL_IMPORT.id,
    del: false,
  },
  {
    id: 162,
    function_name: "getAllViewDoc",
    name: "Получить список видов документов",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: true,
  },

  // -----

  {
    id: 166,
    function_name: "Approve",
    name: "Утвердить",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 167,
    function_name: "getAllInventory",
    name: "Просмотреть список описей",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 168,
    function_name: "createInventory",
    name: "Создать опись",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 169,
    function_name: "Sign",
    name: "Подписать",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 170,
    function_name: "getInventoryById",
    name: "Просмотреть опись",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 171,
    function_name: "updateInventory",
    name: "Редактировать опись",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 172,
    function_name: "getAllRoles",
    name: "Просмотреть (справочник: роли)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 173,
    function_name: "deleteInventory",
    name: "Удалить опись",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 174,
    function_name: "endWorkInputDoc",
    name: "Завершить работу с документом",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 175,
    function_name: "endWorkInnerDoc",
    name: "Завершить работу с документом",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 176,
    function_name: "checkhesh",
    name: "Проверить хэш",
    menu_options_id: OPERATION_MENU.AUDIT.id,
    del: false,
  },
  {
    id: 177,
    function_name: "addExecInStageProject",
    name: "Добавить исполнителя на этап",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  {
    id: 178,
    function_name: "closeProject",
    name: "Закрыть проект",
    menu_options_id: OPERATION_MENU.PROJECT.id,
    del: false,
  },
  // {
  //   id: 179,
  //   function_name: "SignInventory",
  //   name: "Подписать опись",
  //   menu_options_id: OPERATION_MENU.PACK.id,
  //   del: false,
  // },
  // {
  //   id: 180,
  //   function_name: "CheckSignInventry",
  //   name: "Проверить ЭЦП описи",
  //   menu_options_id: OPERATION_MENU.PACK.id,
  //   del: false,
  // },
  {
    id: 181,
    function_name: "getAllDocPackages",
    name: "Просмотреть список дел",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 182,
    function_name: "formInnerInventoryDocPackages",
    name: "Сформировать внутреннюю опись",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 183,
    function_name: "signInnerInventoryDocPackage",
    name: "Подписать внутреннюю опись",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },

  // -----

  // {
  //   id: 185,
  //   function_name: "checkInnerInventorySign",
  //   name: "Проверить ЭЦП на внутренней описи",
  //   menu_options_id: OPERATION_MENU.PACK.id,
  //   del: false,
  // },
  {
    id: 186,
    function_name: "getAllDocInDo",
    name: "Просмотреть список документов",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 187,
    function_name: "findByIdDoc",
    name: "Просмотреть документ",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 188,
    function_name: "DownloadRKK",
    name: "Скачать РКК документа",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 189,
    function_name: "excludeDocs",
    name: "Исключить документ из дела",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 190,
    function_name: "getAllAct",
    name: "Просмотреть список актов",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 191,
    function_name: "createAct",
    name: "Создать акт",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 192,
    function_name: "getActById",
    name: "Просмотреть акт",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 193,
    function_name: "updateAct",
    name: "Редактировать акт",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 194,
    function_name: "deleteAct",
    name: "Удалить акт",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  {
    id: 195,
    function_name: "deleteDocPackageByAct",
    name: "Удалить дела по акту",
    menu_options_id: OPERATION_MENU.PACK.id,
    del: false,
  },
  // {
  //   id: 196,
  //   function_name: "DownloadAck",
  //   name: "Скачать акт",
  //   menu_options_id: OPERATION_MENU.PACK.id,
  //   del: false,
  // },
  // {
  //   id: 197,
  //   function_name: "SignAct",
  //   name: "Подписать акт",
  //   menu_options_id: OPERATION_MENU.PACK.id,
  //   del: false,
  // },
  // {
  //   id: 198,
  //   function_name: "CheckSignAck",
  //   name: "Проверить ЭЦП акта",
  //   menu_options_id: OPERATION_MENU.PACK.id,
  //   del: false,
  // },
  {
    id: 199,
    function_name: "sendDocToDocPackageIN",
    name: "Направить документ в дело",
    menu_options_id: OPERATION_MENU.DOC_INCOME.id,
    del: false,
  },
  {
    id: 200,
    function_name: "sendDocToDocPackageOUT",
    name: "Направить документ в дело",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 201,
    function_name: "sendDocToDocPackageINNER",
    name: "Направить документ в дело",
    menu_options_id: OPERATION_MENU.DOC_INNER.id,
    del: false,
  },
  {
    id: 202,
    function_name: "updateArticle",
    name: "Редактировать (справочник: статьи хранения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 203,
    function_name: "createArticle",
    name: "Добавить запись  (справочник: статьи хранения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 204,
    function_name: "removeArticle",
    name: "Удалить запись (справочник: статьи хранения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },

  // -----

  {
    id: 206,
    function_name: "updateOrg",
    name: "Редактировать (справочник: организации)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },

  // -----

  {
    id: 208,
    function_name: "createOrg",
    name: "Добавить запись (справочник: организации)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 209,
    function_name: "removeOrg",
    name: "Удалить запись (справочник: организации)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 210,
    function_name: "updateViewDoc",
    name: "Редактировать (справочник: виды документов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 211,
    function_name: "createViewDoc",
    name: "Добавить запись (справочник: виды документов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 212,
    function_name: "deleteViewDoc",
    name: "Удалить запись (справочник: виды документов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 213,
    function_name: "updategetTypeJob",
    name: "Редактировать (справочник: типы поручений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 214,
    function_name: "createTypeJob",
    name: "Добавить запись  (справочник: типы поручений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 215,
    function_name: "removeTypeJob",
    name: "Удалить запись (справочник: типы поручений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 216,
    function_name: "updateRelTypes",
    name: "Редактировать (справочник: типы связок)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 217,
    function_name: "createRelTypes",
    name: "Добавить запись  (справочник: типы связок)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 218,
    function_name: "deleteRelTypes",
    name: "Удалить запись (справочник: типы связок)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 219,
    function_name: "updatePost",
    name: "Редактировать (справочник: должности)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 220,
    function_name: "createPost",
    name: "Добавить запись  (справочник: должности)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 221,
    function_name: "removePost",
    name: "Удалить запись (справочник: должности)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 222,
    function_name: "updateCitizen",
    name: "Редактировать (справочник: физ.лица)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 223,
    function_name: "createCitizen",
    name: "Добавить запись  (справочник: физ.лица)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 224,
    function_name: "deleteCitizen",
    name: "Удалить запись (справочник: физ.лица)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 225,
    function_name: "updateUnit",
    name: "Редактировать (справочник: подразделения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 226,
    function_name: "createUnit",
    name: "Добавить запись  (справочник: подразделения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 227,
    function_name: "deleteUnit",
    name: "Удалить запись (справочник: подразделения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 228,
    function_name: "updateDelivery",
    name: "Редактировать (справочник: типы доставки)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 229,
    function_name: "createDelivery",
    name: "Добавить запись  (справочник: типы доставки)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 230,
    function_name: "deleteDelivery",
    name: "Удалить запись (справочник: типы доставки)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 231,
    function_name: "updateNum",
    name: "Редактировать (справочник: шаблоны нумераторов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 232,
    function_name: "createNum",
    name: "Добавить запись  (справочник: шаблоны нумераторов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 233,
    function_name: "deleteNum",
    name: "Удалить запись (справочник: шаблоны нумераторов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },

  {
    id: 235,
    function_name: "sendMail",
    name: "Отправить по почте",
    menu_options_id: OPERATION_MENU.DOC_OUTCOME.id,
    del: false,
  },
  {
    id: 236,
    function_name: "getGroupDictionary",
    name: "Просмотреть запись (справочник: группы)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 237,
    function_name: "addUserInGroup",
    name: "Добавить запись (справочник: группы)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 238,
    function_name: "deleteGroup",
    name: "Удалить запись (справочник: группы)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 239,
    function_name: "deleteUserInGroup",
    name: "Удалить пользователя из группы (справочник: группы)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 240,
    function_name: "listFileBlock",
    name: "Просмотреть файлы письма",
    menu_options_id: OPERATION_MENU.EMAIL_IMPORT.id,
    del: false,
  },
  {
    id: 241,
    function_name: "reportStatCreate",
    name: "Создать и скачать отчет",
    menu_options_id: OPERATION_MENU.REPORT.id,
    del: false,
  },
  {
    id: 243,
    function_name: "createEmp",
    name: "Добавить запись (справочник: текущие назначения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 244,
    function_name: "removeEmp",
    name: "Удалить запись (справочник: текущие назначения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 245,
    function_name: "updateEmp",
    name: "Редактировать (справочник: текущие назначения)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 246,
    function_name: "projectTemplateAdd",
    name: "Добавить запись (справочник: шаблоны проектов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 247,
    function_name: "projectTemplateDelete",
    name: "Удалить запись (справочник: шаблоны проектов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 248,
    function_name: "projectTemplateEdit",
    name: "Редактировать (справочник: шаблоны проектов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 249,
    function_name: "projectTemplatesGet",
    name: "Просмотреть (справочник: шаблоны проектов)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 250,
    function_name: "setJobLoopParam",
    name: "Установить периодичность",
    menu_options_id: OPERATION_MENU.JOB.id,
    del: false,
  },
  {
    id: 251,
    function_name: "setAuditEnabledOperations",
    name: "Изменить настройки аудита",
    menu_options_id: OPERATION_MENU.AUDIT.id,
    del: false,
  },
  {
    id: 252,
    function_name: "getAuditOperations",
    name: "Просмотреть настройки аудита",
    menu_options_id: OPERATION_MENU.AUDIT.id,
    del: false,
  },
  {
    id: 253,
    function_name: "getAuditEnabledOperations",
    name: "Просмотреть включенные настройки аудита",
    menu_options_id: OPERATION_MENU.AUDIT.id,
    del: false,
  },
  {
    id: 254,
    function_name: "addJobsControlType",
    name: "Добавить запись (справочник: тип контроля)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 255,
    function_name: "incmailDelete",
    name: "Удалить из почтового импорта",
    menu_options_id: OPERATION_MENU.EMAIL_IMPORT.id,
    del: false,
  },

  {
    id: 256,
    function_name: "updateEmpReplace",
    name: "Редактировать (справочник: замещений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },

  {
    id: 257,
    function_name: "createEmpReplace",
    name: "Добавить запись  (справочник: замещений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },

  {
    id: 258,
    function_name: "deleteEmpReplace",
    name: "Удалить запись (справочник: замещений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },

  {
    id: 259,
    function_name: "activateEmpReplace",
    name: "Активировать / Деактивировать замещение (справочник: замещений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
  {
    id: 260,
    function_name: "getAllEmpReplace",
    name: "Просмотреть запись (справочник: замещений)",
    menu_options_id: OPERATION_MENU.CATALOG.id,
    del: false,
  },
];
