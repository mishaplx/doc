import { DataSource } from "typeorm";
import { customError } from "../../../../common/type/errorHelper.type";
import { FileBlockEntity } from "../../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../../entity/#organization/file/fileItem.entity";

/********************************************
 * БД: получить список файловых блоков
 ********************************************/
export const fileDBListBlock = async ({
  dataSource,
  ids,
  project_id,
  project_exec_id,
  doc_id,
  job_id,
  incmail_id,
  report_id,
  inventory_id,
  doc_package_id,
  act_id,
  rkk,
  project_required,
}: {
  dataSource: DataSource;
  ids?: number[];
  project_id?: number;
  project_exec_id?: number;
  doc_id?: number;
  job_id?: number;
  incmail_id?: number;
  report_id?: number;
  inventory_id?: number;
  doc_package_id?: number;
  act_id?: number;
  rkk?: boolean;
  project_required?: boolean;
}): Promise<FileBlockEntity[]> => {
  // блокировка
  let i = 0;
  if (doc_id) i++;
  if (project_id) i++;
  if (project_exec_id) i++;
  if (job_id) i++;
  if (incmail_id) i++;
  if (report_id) i++;
  if (inventory_id) i++;
  if (doc_package_id) i++;
  if (act_id) i++;
  if (i == 0) return [];
  if (i != 1) {
    customError("Можно производить выборку только по одному объекту (документу, поручению и т.п.)");
  }

  const where_list: string[] = [];
  if (ids !== undefined) where_list.push("FileBlock.id IN (:...ids)");
  if (project_id !== undefined) where_list.push("FileBlock.project_id = :project_id");
  if (project_exec_id !== undefined)
    where_list.push("FileBlock.project_exec_id = :project_exec_id");
  if (doc_id !== undefined) where_list.push("FileBlock.doc_id = :doc_id");
  if (job_id !== undefined) where_list.push("FileBlock.job_id = :job_id");
  if (incmail_id !== undefined) where_list.push("FileBlock.incmail_id = :incmail_id");
  if (report_id !== undefined) where_list.push("FileBlock.report_id = :report_id");
  if (inventory_id !== undefined) where_list.push("FileBlock.inventory_id = :inventory_id");
  if (doc_package_id !== undefined) where_list.push("FileBlock.doc_package_id = :doc_package_id");
  if (act_id !== undefined) where_list.push("FileBlock.act_id = :act_id");
  if (rkk !== undefined) where_list.push("FileBlock.rkk = :rkk");
  if (project_required !== undefined)
    where_list.push("FileBlock.project_required = :project_required");

  const qb = dataSource
    .createQueryBuilder(FileBlockEntity, "FileBlock")
    .leftJoinAndSelect("FileBlock.FileVersions", "FileVersion");
  if (where_list.length > 0) {
    qb.where(where_list.shift());
  }
  for (const item of where_list) {
    qb.andWhere(item);
  }
  return qb
    .orderBy("FileBlock.id", "ASC")
    .setParameters({
      ids: ids,
      project_id: project_id,
      project_exec_id: project_exec_id,
      doc_id: doc_id,
      job_id: job_id,
      incmail_id: incmail_id,
      report_id: report_id,
      inventory_id: inventory_id,
      doc_package_id: doc_package_id,
      act_id: act_id,
      rkk: rkk,
      project_required: project_required,
    })
    .getMany();
};

/********************************************
 * БД: получить список file_item
 ********************************************/
export const fileDBListItem = async ({
  dataSource,
  ids,
  ext,
  main,
  pdf_format,
  task_pdf_format,
  fail_pdf_format,
  file_version_id,
}: {
  dataSource: DataSource;
  ids?: number[];
  ext?: string;
  main?: boolean;
  pdf_format?: string;
  task_pdf_format?: boolean;
  fail_pdf_format?: boolean;
  file_version_id?: number;
}): Promise<FileItemEntity[]> => {
  let count = 0;
  const where_list: string[] = [];
  if (ids !== undefined && ids.length > 0) {
    where_list.push("FileItem.id IN (:...ids)");
    count += 1;
  }
  if (ext !== undefined) {
    where_list.push("FileItem.ext = :ext");
    count += 1;
  }
  if (main !== undefined) {
    where_list.push("FileItem.main = :main");
    count += 1;
  }
  if (pdf_format !== undefined) {
    where_list.push("FileItem.pdf_format = :pdf_format");
    count += 1;
  }
  if (task_pdf_format !== undefined) {
    where_list.push("FileItem.task_pdf_format = :task_pdf_format");
    count += 1;
  }
  if (fail_pdf_format !== undefined) {
    where_list.push("FileItem.fail_pdf_format = :fail_pdf_format");
    count += 1;
  }
  if (file_version_id !== undefined) {
    where_list.push("FileItem.file_version_id = :file_version_id");
    count += 1;
  }
  if (count == 0) customError("Должно быть задано хоть одно условие выборки");

  const qb = dataSource
    .createQueryBuilder(FileItemEntity, "FileItem")
    .leftJoinAndSelect("FileItem.FileVersion", "FileVersion")
    .leftJoinAndSelect("FileVersion.FileBlock", "FileBlock")
    .leftJoinAndSelect("FileBlock.Doc", "Doc")
    .leftJoinAndSelect("Doc.Cls", "Cls");
  if (where_list.length > 0) {
    qb.where(where_list.shift());
  }
  for (const item of where_list) {
    qb.andWhere(item);
  }
  return await qb
    .orderBy("FileItem.id", "ASC")
    .setParameters({
      ids: ids,
      ext: ext,
      main: main,
      pdf_format: pdf_format,
      task_pdf_format: task_pdf_format,
      fail_pdf_format: fail_pdf_format,
      file_version_id: file_version_id,
    })
    .getMany();
};
