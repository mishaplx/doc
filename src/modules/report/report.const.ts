import { KDOC_ID } from "../doc/doc.const";
import { customError } from "../../common/type/errorHelper.type";

/** БАЗОВЫЙ ПУТЬ К ОТЧЕТАМ, НЕ ЭКСПОРТИРОВАТЬ*/
const PATH = "src/file/report/";

/** БАЗОВЫЙ ПУТЬ К ОТЧЕТАМ WORD, НЕ ЭКСПОРТИРОВАТЬ*/
const PATH_WORD = PATH + "word/";

/** ОТЧЕТЫ: ПУТИ И ФАЙЛЫ */
export const REPORT = {
  PATH: PATH,

  EXCEL: {
    // PATH: PATH+"excel/",
    TEMPLATE: "report.xlsx",
    RESULT: "Статотчет.xlsx",
  },

  WORD: {
    PROJECT: {
      PATH: PATH_WORD + "project/",
      APPROVE: {
        TEMPLATE: "report_project_approve.docx",
        RESULT: "approve.docx",
      },
    },

    DOC: {
      PATH: PATH_WORD + "doc/",
      RKK: {
        TEMPLATE: {
          INCOME: "report_doc_rkk_income.docx",
          OUTCOME: "report_doc_rkk_outcome.docx",
          INNER: "report_doc_rkk_inner.docx",
          // APPEAL: "report_doc_rkk_appeal.docx"
        },
        RESULT: "rkk.docx",
      },
    },

    JOB: {
      PATH: PATH_WORD + "job/",
      RKK: {
        TEMPLATE: "report_job_rkk.docx",
        RESULT: "rkk.docx",
      },
    },

    ACT: {
      PATH: PATH_WORD + "act/",
      ACT_REMOVE: {
        TEMPLATE: "report_act_remove.docx",
        RESULT: "act_remove.docx",
      },
    },

    INVENTORY: {
      PATH: PATH_WORD + "inventory/",
      // INVENTORY_INCOME: {
      //   TEMPLATE: "report_inventory_income.docx",
      //   RESULT: "",
      // },
      INVENTORY_INNER: {
        TEMPLATE: "report_inventory_inner.docx",
        RESULT: "inner_inventory.docx",
      }
    },
  },

  ERR: "Отчет: ошибка ",
};

/********************************************
 * ДОКУМЕНТ: ПУТЬ+ФАЙЛ ШАБЛОНА
 ********************************************/
export const getReportDocPathTemplate = (kdoc_id: number): string => {
  let ret = "";
  switch (kdoc_id) {
    case KDOC_ID.INCOME:
      ret = REPORT.WORD.DOC.PATH + REPORT.WORD.DOC.RKK.TEMPLATE.INCOME;
      break;
    case KDOC_ID.OUTCOME:
      ret = REPORT.WORD.DOC.PATH + REPORT.WORD.DOC.RKK.TEMPLATE.OUTCOME;
      break;
    case KDOC_ID.INNER:
      ret = REPORT.WORD.DOC.PATH + REPORT.WORD.DOC.RKK.TEMPLATE.INNER;
      break;
    // case KDOC_ID.APPEAL:
    //   ret = REPORT.WORD.DOC.PATH + REPORT.WORD.DOC.RKK.TEMPLATE.APPEAL;
    //   break;
    default:
      customError("Не определен тип документа");
  }
  return ret;
};

/********************************************
 * ПРОЕКТ: ПУТЬ+ФАЙЛ ШАБЛОНА
 ********************************************/
export const getReportProjectPathTemplate = (): string =>
  REPORT.WORD.PROJECT.PATH + REPORT.WORD.PROJECT.APPROVE.TEMPLATE;

/********************************************
 * ПРОЕКТ: ФАЙЛ РЕЗУЛЬТАТА
 * TODO: сделать универсальность
 ********************************************/
export const getReportProjectFileResult = (project_id: number): string =>
  "project_" + project_id + "_" + REPORT.WORD.PROJECT.APPROVE.RESULT;


/********************************************
 * ДОКУМЕНТ: ФАЙЛ РЕЗУЛЬТАТА
 ********************************************/
export const getReportDocFileResult = (doc_id: number): string =>
  "doc_" + doc_id + "_" + REPORT.WORD.DOC.RKK.RESULT;


/********************************************
 * ПОРУЧЕНИЕ: ПУТЬ+ФАЙЛ ШАБЛОНА
 ********************************************/
export const getReportJobPathTemplate = (): string =>
  REPORT.WORD.JOB.PATH + REPORT.WORD.JOB.RKK.TEMPLATE;

/********************************************
 * ПОРУЧЕНИЕ: ФАЙЛ РЕЗУЛЬТАТА
 ********************************************/
export const getReportJobFileResult = (job_id: number): string =>
  "job_" + job_id + "_" + REPORT.WORD.JOB.RKK.RESULT;

/********************************************
 * АКТ: ПУТЬ+ФАЙЛ ШАБЛОНА
 ********************************************/
export const getReportActPathTemplate = (): string =>
  REPORT.WORD.ACT.PATH + REPORT.WORD.ACT.ACT_REMOVE.TEMPLATE;

/********************************************
 * АКТ: ФАЙЛ РЕЗУЛЬТАТА
 ********************************************/
export const getReportActFileResult = (act_id: number): string =>
  "act_" + act_id + "_" + REPORT.WORD.ACT.ACT_REMOVE.RESULT;

/********************************************
 * ВНУТРЕННЯЯ ОПИСЬ: ПУТЬ+ФАЙЛ ШАБЛОНА
 ********************************************/
export const getReportInnerInventoryPathTemplate = (): string =>
  REPORT.WORD.INVENTORY.PATH + REPORT.WORD.INVENTORY.INVENTORY_INNER.TEMPLATE;

/********************************************
 * ВНУТРЕННЯЯ ОПИСЬ: ФАЙЛ РЕЗУЛЬТАТА
 ********************************************/
export const getReportInnerInventoryFileResult = (inner_inventory_id: number): string =>
  "inner_inventory_" + inner_inventory_id + "_" + REPORT.WORD.INVENTORY.INVENTORY_INNER.RESULT;
