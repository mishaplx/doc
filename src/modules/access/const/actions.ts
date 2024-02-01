import { ActionsDoc } from "../../../BACK_SYNC_FRONT/actions/actions.doc";
import { ActionsJob } from "../../../BACK_SYNC_FRONT/actions/actions.job";
import { ActionsProject } from "../../../BACK_SYNC_FRONT/actions/actions.project";
import { AccessDoc } from "../accessValid/doc/accessValid.doc";
import { AccessJob } from "../accessValid/job/accessValid.job";
import { AccessProject } from "../accessValid/project/accessValid.project";

/**
 * КАТЕГОРИИ ОПЕРАЦИЙ
 * @key actions - список возможный операций для объекта
 * @key validator - класс-валидатор
 * @key dto_in - допустимые значения названия DTO для идентификации объектов
 * @key keys_in - допустимые значения аргументов для идентификации объектов, !!! привести к нижнему регистру !!!
 * @key key_out - название идентификатора объекта для передачи в valid
 */
export const ACTION_OBJECTS = [
  {
    actions: ActionsProject,
    validator: AccessProject,
    dto_in: ["project"],
    keys_in: ["project_id", "projectid", "id_project"],
    key_out: "project",
  },
  {
    actions: ActionsDoc,
    validator: AccessDoc,
    dto_in: ["doc"],
    keys_in: ["doc_id", "docid"],
    key_out: "doc",
  },
  {
    actions: ActionsJob,
    validator: AccessJob,
    dto_in: ["job"],
    keys_in: ["job_id", "jobid"],
    key_out: "job",
  },
  {
    actions: undefined,
    validator: undefined,
    dto_in: ["execjob"],
    keys_in: ["exec_job_id", "execjob_id", "execjobid"],
    key_out: "exec_job",
  },
  // {
  //   actions: ActionsReport,
  //   validator: AccessReport,
  //   dto_in: ['project'],
  //   keys_in: ['report_id', 'reportid'],
  //   key_out: 'report',
  // },
  // {
  //   actions: ACTION_CATEGORY_INCMAIL,
  //   validator: AccessIncmail,
  //   dto_in: ['incmail'],
  //   keys_in: ['incmail_id', 'incmailid'],
  //   key_out: 'incmail',
  // },
] as const;

export const ACTION_OBJECTS_KEYS_OUT = ACTION_OBJECTS.map((item) => item.key_out);
export type TYPE_ACTION_OBJECTS_KEYS_OUT = {
  [K in (typeof ACTION_OBJECTS_KEYS_OUT)[number]]?: number[];
};
