import { EntityManager } from "typeorm";

import { v4 as uuidv4 } from "uuid";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError } from "../../../common/type/errorHelper.type";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { FILE } from "../file.const";
import { deleteFileBlockMaskUtil } from "../fileDelete/fileDelete.utils";
import { fileDBCreateMain } from "../utils/db/file.db.createMain.utils";
import { IFileBlockMask } from "../utils/db/file.db.delete.utils";
import { deleteFileVolume, getPathVolume, writeFileVolume } from "../utils/file.volume.utils";
import { fileCreateDto, fileDateDto } from "./fileCreate.dto";
import { verifyBlockedFileOrFail } from "../utils/file.blocked.utils";
import { FileVersionEntity } from "src/entity/#organization/file/fileVersion.entity";
import { FileBlockEntity } from "src/entity/#organization/file/fileBlock.entity";

const ERR = "Файлы: ошибка ";

/********************************************
 * БД: ЗАРЕГИСТРИРОВАТЬ ГЛАВНЫЙ ФАЙЛ
 * (вызов из uploadFile)
 * @param files - если список файлов - то каждый файл в новый блок
 * @param param.idFileBlock - если задан - создать новую версию, иначе создать новый блок/версию
 * @param file_block_one - признак: у объекта+param.rkk возможен только один файловый блок, т.е. старые файловые блоки удалить
 * @param file_version_one - признак: старые версии файла удалить
 ********************************************/
export const createFileMainUtil = async ({
  manager,
  files,
  param,
  token,
  file_block_one = false,
  file_version_one = false,
}: {
  manager: EntityManager;
  files: fileDateDto[];
  param: fileCreateDto;
  token?: IToken;
  file_block_one?: boolean;
  file_version_one?: boolean;
}): Promise<FileItemEntity[]> => {
  try {
    /********************************
     * блокировки
     ********************************/
    if (files.length == 0) {
      customError("Не задан файл(ы)");
    }

    if (files.length > 1 && (param.idFileBlock || !file_block_one)) {
      customError("Недопустимо загружать несколько файлов в один блок");
    }

    if (files.length > 1 && param.sign) {
      customError("Недопустимо загружать несколько файлов с одной подписью");
    }

    /**
     * если файловый блок не задан - создается новый
     */
    if (!param.idFileBlock) {
      let i = 0;
      if (param.idDoc) i++;
      if (param.idProject) i++;
      if (param.idProjectExec) i++;
      if (param.idJob) i++;
      if (param.idIncmail) i++;
      if (param.idReport) i++;
      if (param.idInventory) i++;
      if (param.idDocPackage) i++;
      if (param.idAct) i++;
      if (param.isTemplate) i++;
      if (i != 1) {
        customError("Файл должен быть связан только с одним объектом (документом, поручением и пр.)");
      }

    /**
     * если файловый блок задан - создается версия
     */
    } else {
      // проверить - заблокирован ли блок ранее
      await verifyBlockedFileOrFail({
        manager: manager,
        file_block_id: param.idFileBlock,
        user_session_id: token?.session_id,
      });
    }

    if (param.rkk && !param.idDoc) {
      customError("Карточка РКК может крепиться только к документу");
    }

    if (param.project_required && !param.idProject) {
      customError("Обязательность файла проекта может относиться только к проекту документа");
    }

    if (!token && !param.idIncmail) {
      customError("Должен быть указан автор файла");
    }

    // маска для идентификации файлового блока
    const mask: IFileBlockMask = {
      doc_id: param.idDoc,
      job_id: param.idJob,
      project_id: param.idProject,
      project_required: param.project_required,
      project_exec_id: param.idProjectExec,
      incmail_id: param.idIncmail,
      report_id: param.idReport,
      inventory_id: param.idInventory,
      doc_package_id: param.idDocPackage,
      act_id: param.idAct,
      rkk: param.rkk,
    };

    // удалить старый файловый блок
    if (file_block_one) {
      await deleteFileBlockMaskUtil({
        manager: manager,
        mask: mask,
      });
    }

    const fileItems: FileItemEntity[] = [];
    for (const file of files) {
      // сохранить файл в хранилище VOLUME
      const date_create = new Date();
      const volume = uuidv4();
      const filePath = getPathVolume(
        manager.connection.options.database as string,
        date_create,
        volume,
      );
      await writeFileVolume({
        stream: file.stream,
        filePath: filePath,
        compress: param.compress ?? FILE.VOLUME.COMPRESS_DEFAULT,
      });

      let task_pdf_create = param.pdfCreate ?? FILE.DB.PDF_CREATE_DEFAULT;
      if (param.isTemplate) task_pdf_create = false;

      /**
       * старое имя файла если:
       * - задан idFileBlock
       * - установлен признак isFileNameOld
       * - не установлен признак file_block_one
       * - записывается 1 файл
       */
      let newFileName = file.originalname;
      if (
        param.idFileBlock &&
        param.isFileNameOld &&
        !file_block_one &&
        files.length == 1
      ) {
        const { FileVersionMain } = await manager.findOneByOrFail(FileBlockEntity, { id: param.idFileBlock });
        const { name, FileItemMain: { ext } } = await FileVersionMain;
        newFileName = name + '.' + ext;
      }

      // создать запись в БД
      try {
        const fileItemEntity = (await fileDBCreateMain({
          manager: manager,
          file_version_one: file_version_one,
          block: {
            ...mask,
            file_block_id: param.idFileBlock,
          },
          version: {
            file_name: newFileName,
            note: param.note ?? "",
            emp_id: token?.current_emp_id,
            task_pdf_create,
            pdf_only: param.pdfOnly,
            notify_complete_depend: param.notifyCompleteDepend,
          },
          item: {
            volume: volume,
            date_create: date_create,
            compress: param.compress ?? FILE.VOLUME.COMPRESS_DEFAULT,
          },
          sign: param.sign,
        })) as FileItemEntity;
        fileItems.push(fileItemEntity);
      } catch(err) {
        // при ошибке удалить незарегистрированный файл в хранилище
        await deleteFileVolume({
          filePath: filePath,
          isThrow: false,
        });
        throw new Error(err);
      }
    }

    return fileItems;
  } catch (err) {
    customError(ERR + "регистрации главного файла", err, { param, emp_id: token?.current_emp_id });
  }
};
