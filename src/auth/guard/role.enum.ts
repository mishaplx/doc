
/**
 * СМЕЖНЫЕ РАЗРЕШЕННЫЕ ОПЕРАЦИИ
 * TODO: ПОТОМ ВСЕ ПЕРЕДЕЛАТЬ
 */
export const OperationNeighborList = {
  "getAllEmpReplace": [
    "getEmpReplaceById",
  ],
};

export const OperationType = {
  CreateDoc: {
    1: "CreateInputDoc",
    2: "CreateOutputDoc",
    3: "CreateInnerDoc",
  },
  sendToPackage: {
    1: "sendDocToDocPackageIN",
    2: "sendDocToDocPackageOUT",
    3: "sendDocToDocPackageINNER",
  },
  endWork: {
    1: "endWorkInputDoc",
    3: "endWorkInnerDoc",
  },
  GetAllDoc: {
    1: "GetAllInputDoc",
    2: "GetAllOutputDoc",
    3: "GetAllInnerDoc",
  },

  getAllRoles: "getAllRoles", // скачать файл с поручений
  findDoc: {
    1: "findByIdDocInputDoc",
    2: "findByIdDocutputDoc",
    3: "findByIdDocInnerDoc",
    dependentOperation: ["priv", "getAllLanguage", "getAllViewDoc"],
  },
  SaveDoc: {
    1: "SaveInputDoc",
    2: "SaveOutputDoc",
    3: "SaveInnerDoc",
  },
  RegistrateDoc: {
    1: "RegistrateInputDoc",
    2: "RegistrateOutputDoc",
    3: "RegistrateInnerDoc",
  },
  AddReceiver: {
    1: "AddReceiverInputDoc",
    3: "AddReceiverInnerDoc",
  },
  getAllJobsInDoc: {
    1: "getAllJobsInInputDoc",
    3: "getAllJobsInInnerDoc",
  },
  DownloadDocument: {
    1: "DownloadInputDoc",
    2: "DownloadOutputDoc",
    3: "DownloadInnerDoc",
  },
  DownloadRKK: "DownloadRKK",
  DeleteItem: {
    1: "DeleteInputDoc",
    2: "DeleteOutputDoc",
    3: "DeleteInnerDoc",
    4: "deleteJobs",
    5: "deleteProject",
  },
  stageWithConfirm: {
    1: "stageWithConfirm", //Визировать
    2: "Sign", //Подписать
    3: "Approve", //Утвердить
  },
  SignInputDocFile: "SignInputDocFile", //подписать файл входящего докумета
  SignOutPutDocFile: "SignOutPutDocFile", //подписать файл исходящего  докумета
  SignInnerDocFile: "SignInnerDocFile", //подписать файл внутреннего докумета
  SignJobsFile: "SignJobsFile", //подписать файл в поручениях

  UploadFile: {
    1: "UploadFileinInputDoc", // загрузить файл в входящий документ
    2: "UploadFileinOutputDoc", // загрузить файл в исходящий документ
    3: "UploadFileinInnerDoc", // загрузить файл в внутренний документ
    4: "UploadFileinInJob", // загрузить файл в поручения
    5: "UploadFileinInProject", // загрузить файл в поручения
  },

  DownloadFile: {
    1: "DownloadFileinInputDoc",
    2: "DownloadFileinOutputDoc",
    3: "DownloadFileinInnerDoc",
    4: "DownloadFileJob",
    5: "DownloadFileInProject",
  },
  ViewFile: {
    1: "getAllFileForDocInput",
    2: "getAllFileForDocOut",
    3: "getAllFileForDocInner",
    4: "getFileByJob",
    5: "getAllFileForProject",
    6: "listFileBlock",
  },
  updateProject: {
    1: "saveProject",
    2: "sendToRoute",
    3: "updateProject",
  },
  ListStage: {
    1: "ListVisa", //список (визировать)
    2: "ListSign", //список (подписать)
    3: "ListConfirm", //список (утвердить)
  },
  getAllDocInDo: "getAllDocInDo",
  Audit: {
    checkhesh: "checkhesh",
    downloadFile: "downloadFile",
  },
  reportStatCreate: "reportStatCreate",
};
// DeleteFileInputDoc: 'DeleteFileInputDoc', // удалить (файл) входящий документ
//     DeleteFileOutputDoc: 'DeleteFileOutputDoc', // удалить (файл) Исходящий документ
//     DeleteFileInnerDoc: 'DeleteFileInnerDoc', // удалить (файл) документ
// EditInputDoc: 'EditInputDoc', // редактровать входящий документ
//     EditOutputDoc: 'EditOutputDoc', // редактровать Исходящий документ
//     EditInnerDoc: 'EditInnerDoc', // редактровать внутренний документ
// RegistrateInputDoc: 'RegistrateInputDoc', // зарегестировать входящий документ
//     RegistrateOutputDoc: 'RegistrateOutputDoc', // зарегестировать Исходящий документ
//     RegistrateInnerDoc: 'RegistrateInnerDoc', // зарегестировать внутренний документ
// DeleteInputDoc: 'DeleteInputDoc', // удалить входящий документ
//     DeleteOutputDoc: 'DeleteOutputDoc', // удалить Исходящий документ
//     DeleteInnerDoc: 'DeleteInnerDoc',
// DownloadInputDoc: 'DownloadInputDoc', // Скачать входящий документ
//     DownloadOutputDoc: 'DownloadOutputDoc', // Скачать Исходящий документ
//     DownloadInnerDoc: 'DownloadInnerDoc', // Скачать внутренний документ
// 'DownloadFileinInputDoc' : 'DownloadFileinInputDoc', // скачать файл в входящий документ
// 'DownloadFileinOutputDoc' : 'DownloadFileinOutputDoc', // скачать файл в исходящий документ
// 'DownloadFileinInnerDoc' : 'DownloadFileinInnerDoc', // скачать файл в внутренний документ
// SaveInputDoc: 'SaveInputDoc', // сохранить входящий документ
// SaveOutputDoc: 'SaveOutputDoc', // сохранить Исходящий документ
// SaveInnerDoc: 'SaveInnerDoc', // сохранить  документ

// DownloadFileInProject: 'DownloadFileInProject', // удалить (файл) документ
// findByIdDocInputDoc: 'findByIdDocInputDoc', // получить документ по ID
//     findByIdDocutputDoc: 'findByIdDocutputDoc', // получить документ по ID
//     findByIdDocInnerDoc: 'findByIdDocInnerDoc', // получить документ по ID
//   GetAllInputDoc: 'GetAllInputDoc', // получить все входяшие документы
//     GetAllOutputDoc: 'GetAllOutputDoc', // получить все исходяшие документы
//     GetAllInnerDoc: 'GetAllInnerDoc', // получить все внутренние документы
// CreateInputDoc: 'CreateInputDoc', // получить все входяший документ
//     CreateOutputDoc: 'CreateOutputDoc', // создать исходяший документ
//     CreateInnerDoc: 'CreateInnerDoc', // создать внутренний  документ

/**
 * ОБЩЕДОСТУПНЫЕ ОПЕРАЦИИ ДЛЯ ВСЕХ РОЛЕЙ
 */
export const arrGeneralOperation = [
  "SearchEmp",
  "priv",
  "getAllLanguage",
  "getAllViewDoc",
  "getCorrectRoute",
  "getIncmailById",
  "checkDublicateDocRegistrate",
];
