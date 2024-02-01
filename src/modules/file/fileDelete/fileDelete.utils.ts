import { EntityManager } from "typeorm";

import { customError } from "../../../common/type/errorHelper.type";
import {
  fileDBDeleteBlockId,
  fileDBDeleteBlockMask,
  fileDBDeleteItem,
  fileDBDeleteVersion,
  IFileBlockMask,
} from "../utils/db/file.db.delete.utils";
import { verifyBlockedFileOrFail } from "../utils/file.blocked.utils";
import { deleteFileListVolume } from "../utils/file.volume.utils";
import { wLogger } from "../../logger/logging.module";

const ERR = "Файлы: ошибка удаления ";

/********************************************
 * БД+VOLUME: УДАЛИТЬ ФАЙЛОВЫЙ БЛОК И ФАЙЛЫ ПО МАСКЕ
 ********************************************/
export const deleteFileBlockMaskUtil = async (args: {
  manager: EntityManager;
  mask: IFileBlockMask;
}): Promise<boolean> => {
  try {
    // удалить записи в БД
    const filePathList = await fileDBDeleteBlockMask(args);

    // удалить файлы, не прерываясь на ошибки (в БД ссылки на файлы уже удалены)
    return await deleteFileListVolume({
      filePathList: filePathList,
      isThrow: false,
    });
  } catch (err) {
    wLogger.error(err);
    customError(ERR + "блока");
  }
};

/********************************************
 * БД+VOLUME: УДАЛИТЬ FILE_BLOCK И ФАЙЛЫ ПО ID
 ********************************************/
export const deleteFileBlockIdUtil = async (args: {
  manager: EntityManager;
  idFileBlock: number;
  user_session_id: number;
}): Promise<boolean> => {
  try {
    const { manager, idFileBlock, user_session_id } = args;

    // проверить - заблокирован ли блок ранее
    await verifyBlockedFileOrFail({
      manager: manager,
      file_block_id: idFileBlock,
      user_session_id: user_session_id,
    });

    // удалить записи в БД
    const filePathList = await fileDBDeleteBlockId({
      manager: manager,
      idFileBlock: idFileBlock,
    });

    // удалить файлы, не прерываясь на ошибки (в БД ссылки на файлы уже удалены)
    return await deleteFileListVolume({
      filePathList: filePathList,
      isThrow: false,
    });
  } catch (err) {
    wLogger.error(err);
    customError(ERR + "блока");
  }
};

/********************************************
 * БД+VOLUME: УДАЛИТЬ FILE_VERSION И ФАЙЛЫ
 * ЕСЛИ ВЕРСИЯ ЕДИНСТВЕННАЯ - УДАЛИТЬ БЛОК ЦЕЛИКОМ
 ********************************************/
export const deleteFileVersionUtil = async ({
  manager,
  idFileVersion,
}: {
  manager: EntityManager;
  idFileVersion: number;
}): Promise<boolean> => {
  try {
    // удалить записи в БД
    const filePathList = await fileDBDeleteVersion({
      manager: manager,
      idFileVersion: idFileVersion,
    });

    // удалить файлы, не прерываясь на ошибки (в БД ссылки на файлы уже удалены)
    return await deleteFileListVolume({
      filePathList: filePathList,
      isThrow: false,
    });
  } catch (err) {
    wLogger.error(err);
    customError(ERR + "версии");
  }
};

/********************************************
 * БД+VOLUME: УДАЛИТЬ ЗАВИСИМЫЙ ФАЙЛ
 ********************************************/
export const deleteFileItemUtil = async ({
  manager,
  idFileVersion,
  main,
}: {
  manager: EntityManager;
  idFileVersion: number;
  main: boolean;
}): Promise<boolean> => {
  try {
    // удалить записи в БД
    const filePath = await fileDBDeleteItem({
      manager: manager,
      idFileVersion: idFileVersion,
      main: main,
    });

    // удалить файл, не прерываясь на ошибки (в БД ссылки на файл уже удалены)
    return await deleteFileListVolume({
      filePathList: [filePath],
      isThrow: false,
    });
  } catch (err) {
    wLogger.error(err);
    customError(ERR + "зависимого файла");
  }
};
