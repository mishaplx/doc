import { v4 as uuidv4 } from "uuid";

import { getDataSourceAdmin } from "../../../database/datasource/tenancy/tenancy.utils";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";
import { FILE_FORMAT_PDF } from "../file.const";
import { createPdf } from "../integration/file.integration.pdfCreate";
import { FileDataWorker } from "./pdfCreateWorker";
import { fileItemDBCreateDepend } from "../utils/db/file.db.createDepend.utils";
import { fileDBDeleteItem } from "../utils/db/file.db.delete.utils";
import { bufferToStream } from "../utils/file.common.utils";
import { wLogger } from "../../logger/logging.module";
import {
  deleteFileListVolume,
  fileExists,
  getPathVolume,
  readFileVolume,
  writeFileVolume,
} from "../utils/file.volume.utils";

/**
 * customError не использовать, т.к. все логируется выше
 */
export async function createPdfLogic(fileWorkerData: FileDataWorker): Promise<boolean> {
  // wLogger.info(`Worker пробует конвертировать ID: ${fileVersionEntity.id}`)
  const dataSource = await getDataSourceAdmin(fileWorkerData.org);
  const fileVersionRepository = dataSource.getRepository(FileVersionEntity);

  const fileItemMainEntity = fileWorkerData.fileVersionEntity.FileItemMain;
  const filePathDelCommit = []; // список файлов для удаления при успешной транзакции
  const filePathDelRollback = []; // список файлов для удаления при НЕ успешной транзакции
  let filePathDel = [];
  try {
    // ========================================
    // ТРАНЗАКЦИЯ: НАЧАТЬ
    // ========================================
    await dataSource.transaction(async (manager) => {
      // путь к главному файлу
      const filePathMain = getPathVolume(
        dataSource.options.database.toString(),
        fileItemMainEntity.date_create,
        fileItemMainEntity.volume,
      );

      // при отсутствии главного файла (FileItem есть) - ошибка
      if (!fileExists(filePathMain)) {
        throw new Error("Файл не найден: "+filePathMain);
        // customError("Файл не найден: "+filePathMain);
      }

      // главный файл в поток
      const stream = await readFileVolume({
        filePath: filePathMain,
        compress: fileItemMainEntity.compress,
        isProxy: true,
        fileExtOrigin: "." + fileItemMainEntity.ext,
      });

      //
      // СТАРЫЙ ЗАВИСИМЫЙ PDF файл: при наличии - удалить
      //
      if (fileWorkerData.fileVersionEntity.FileItemDepend !== undefined) {
        // удалить из БД
        const filePath = await fileDBDeleteItem({
          manager: manager,
          idFileVersion: fileWorkerData.fileVersionEntity.id,
          main: false,
        });

        // удалить из VOLUME при успешной транзакции
        filePathDelCommit.push(filePath);
      }

      //
      // НОВЫЙ PDF файл
      //
      // создать и поместить в буфер
      const buffer = await createPdf({
        org: fileWorkerData.org,
        stream: stream,
      });
      if (!buffer) throw new Error("Ошибка создания PDF-файла");

      // сохранить в хранилище VOLUME
      const date_create = new Date();
      const volume = uuidv4();
      const filePath = getPathVolume(fileWorkerData.org, date_create, volume);
      await writeFileVolume({
        stream: bufferToStream(buffer),
        filePath: filePath,
        compress: fileItemMainEntity.compress,
      });

      // удалить при ошибке
      filePathDelRollback.push(filePath);

      // сохранить в БД
      const fileItemEntity = await fileItemDBCreateDepend({
        manager: manager,
        idFileVersion: fileWorkerData.fileVersionEntity.id,
        item: {
          volume: volume,
          date_create: date_create,
          compress: fileItemMainEntity.compress,

          // допущение: формат созданного файла достоверно известен
          task_pdf_format: false,
          pdf_format: FILE_FORMAT_PDF.FILE_FORMAT_PDF_A1B,
        },
      });

      //
      // Если задача: хранить только PDF как основной файл
      //
      if (fileWorkerData.fileVersionEntity.pdf_only) {
        // основной файл: удалить из БД
        const filePathMain = await fileDBDeleteItem({
          manager: manager,
          idFileVersion: fileWorkerData.fileVersionEntity.id,
          main: true,
        });

        // основной файл: удалить из VOLUME при успешной транзакции
        filePathDelCommit.push(filePathMain);

        // БД: сделать зависимый файл основным
        await manager.update(FileItemEntity, { id: fileItemEntity.id }, { main: true });
      }

      //
      // записать контент, сбросить признак задачи
      //
      await manager.update(FileVersionEntity, fileWorkerData.fileVersionEntity.id, {
        task_pdf_create: false,
        fail_pdf_create: false,
        // pdf_only: false,
      });
    });
    // ========================================
    // ТРАНЗАКЦИЯ: ЗАВЕРШИТЬ
    // ========================================
    // список файлов на удаление при успешной транзакции
    filePathDel = filePathDelCommit;

    return true;
  } catch (err) {
    wLogger.error(err?.message);

    // отметить ошибку в БД
    await fileVersionRepository.update(fileWorkerData.fileVersionEntity.id, {
      fail_pdf_create: true,
    });

    // список файлов на удаление при НЕ успешной транзакции
    filePathDel = filePathDelRollback;

    return false;
  } finally {
    // удалить файлы из VOLUME не прерываясь на ошибки
    await deleteFileListVolume({
      filePathList: filePathDel,
      isThrow: false,
    });
  }
}
