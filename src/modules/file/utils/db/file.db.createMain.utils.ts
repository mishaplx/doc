import * as path from "path";
import { EntityManager } from "typeorm";

import { FileBlockEntity } from "../../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../../entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "../../../../entity/#organization/file/fileVersion.entity";
import { signAddUtil } from "../../../sign/utils/sign.utils";
import { deleteFileVersionUtil } from "../../fileDelete/fileDelete.utils";

export interface IFileDBCreateMain {
  file_version_one?: boolean;
  block: {
    file_block_id?: number;
    doc_id?: number;
    job_id?: number;
    project_id?: number;
    project_required?: boolean;
    project_exec_id?: number;
    incmail_id?: number;
    report_id?: number;
    inventory_id?: number;
    doc_package_id?: number;
    act_id?: number;
    rkk?: boolean;
  };
  version: {
    file_name: string;
    content?: string;
    task_main_content?: boolean;
    task_pdf_create?: boolean;
    note?: string;
    emp_id?: number;
    pdf_only?: boolean;
    notify_complete_depend?: boolean;
  };
  item: {
    volume: string;
    date_create: Date;
    pdf_format?: string;
    task_pdf_format?: boolean;
    compress?: boolean;
  };
  sign?: string;
}

interface IManager {
  manager: EntityManager;
}
interface ICreateMain extends IManager, IFileDBCreateMain {}

/********************************************
 * БД: зарегистрировать основной файл
 * @param manager
 * @param file_block_id - если указан то регистрируется новая версия иначе регистрируется новый файловый блок
 * @param file_version_one - признак: старые версии файла удалить
 * @param doc_id
 * @param job_id
 * @param project_id
 * @param project_required
 * @param project_exec_id
 * @param incmail_id
 * @param report_id
 * @param inventory_id
 * @param doc_package_id
 * @param act_id
 * @param rkk
 * @param file_name
 * @param content
 * @param task_main_content
 * @param task_pdf_create
 * @param note
 * @param emp_id
 * @param pdf_only
 * @param notify_complete_depend
 * @param volume
 * @param date_create
 * @param pdf_format
 * @param task_pdf_format
 * @param compress
 * @param sign - ЭЦП в PEM-формате
 ********************************************/
export const fileDBCreateMain = async ({
  manager,
  file_version_one = false,
  block: {
    file_block_id = null,
    doc_id = null,
    job_id = null,
    project_id = null,
    project_required = false,
    project_exec_id = null,
    incmail_id = null,
    report_id = null,
    inventory_id = null,
    doc_package_id = null,
    act_id = null,
    rkk = false,
  },
  version: {
    file_name,
    content = null,
    task_main_content = true,
    task_pdf_create,
    note = null,
    emp_id = null,
    pdf_only = false,
    notify_complete_depend = false,
  },
  item: { volume, date_create, pdf_format = "", task_pdf_format = true, compress },
  sign = null,
}: ICreateMain): Promise<FileItemEntity> => {
  const { name: only_name, ext: only_ext } = path.parse(file_name);
  const only_ext_short = only_ext.slice(1);
  const newBlock = file_block_id == null;
  let fileBlockEntity: FileBlockEntity;

  // если блок не задан - создать блок
  if (newBlock) {
    fileBlockEntity = manager.create(FileBlockEntity, {
      doc_id: doc_id,
      job_id: job_id,
      project_id: project_id,
      project_required: project_required,
      project_exec_id: project_exec_id,
      incmail_id: incmail_id,
      report_id: report_id,
      inventory_id: inventory_id,
      doc_package_id: doc_package_id,
      act_id: act_id,
      rkk: rkk,
    });
    fileBlockEntity = await manager.save(FileBlockEntity, fileBlockEntity);
    file_block_id = fileBlockEntity.id;
  } else {
    // получить файловый блок
    fileBlockEntity = await manager.findOneByOrFail(FileBlockEntity, { id: file_block_id });
  }

  // удалить старые версии
  if (!newBlock && file_version_one) {
    for (const fileVersionEntity of await fileBlockEntity.FileVersions)
      deleteFileVersionUtil({
        manager,
        idFileVersion: fileVersionEntity.id,
      });
  }

  // номер версии
  const version_counter = fileBlockEntity.file_version_counter;

  // создать новую версию
  let fileVersionEntity = manager.create(FileVersionEntity, {
    file_block_id: fileBlockEntity.id,
    name: only_name,
    content: content,
    task_main_content: task_main_content, // задача: извлечь текст
    task_pdf_create: task_pdf_create && only_ext_short !== "pdf", // задача: создать PDF (если не PDF)
    note: note,
    pdf_only: pdf_only,
    notify_complete_depend: notify_complete_depend,
    emp_id: emp_id,
    version: version_counter + 1,
  });
  fileVersionEntity = await manager.save(FileVersionEntity, fileVersionEntity);

  // создать item Main
  const fileItemEntity = manager.create(FileItemEntity, {
    file_version_id: fileVersionEntity.id,
    volume: volume,
    ext: only_ext_short,
    date_create: date_create,
    main: true,
    pdf_format: pdf_format,
    task_pdf_format: task_pdf_format && only_ext_short === "pdf", // задача: определить тип PDF (если PDF)
    compress: compress,
  });
  await manager.save(FileItemEntity, fileItemEntity);

  // отметить загруженный файл как текущая версия, обновить счетчик версий
  await manager.update(
    FileBlockEntity,
    { id: fileBlockEntity.id },
    {
      file_version_main: fileVersionEntity.id,
      file_version_counter: version_counter + 1,
    },
  );

  // добавить подпись
  if (sign != null) {
    await signAddUtil({
      manager: manager,
      file_item_id: fileItemEntity.id,
      sign: sign,
      emp_id: emp_id,
    });
  }

  return fileItemEntity;
};
