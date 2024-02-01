import { EntityManager } from "typeorm";
import { DocEntity } from "../../../entity/#organization/doc/doc.entity";
import { JobEntity } from "../../../entity/#organization/job/job.entity";

export const docNameforJob = (doc: DocEntity | undefined): string => {
  if (!doc) return "";

  const drSeriliz = `${doc.dr}`;
  const regDate = (drSeriliz ?? "").trim();
  const regNumber = (doc.reg_num ?? "").trim();
  const regBody = (doc.body ?? "").trim().slice(0, 20) + "...";
  let ret = "";
  if (regDate != "") ret += regDate;
  if (regNumber != "") ret += " №" + regNumber;
  if (regBody != "") ret += " " + regBody;
  return ret;
};

/**
 * получить id документа, зная id поручения (в т.ч. связанного)
 */
export const job2doc = async (args: {
  manager: EntityManager;
  job_id: number;
}): Promise<number> => {
  let loop_parent_id = args.job_id;
  let loop_job_id: number;
  let loop_doc_id: number;
  do {
    loop_job_id = loop_parent_id;
    const jobEntity = await args.manager.findOneOrFail(JobEntity, {
      select: { parent_job_id: true, doc_id: true },
      where: { id: loop_job_id },
    });
    loop_parent_id = jobEntity.parent_job_id;
    loop_doc_id = jobEntity.doc_id;
  } while (loop_parent_id);

  return loop_doc_id;
};
