import { EntityManager } from "typeorm";

import { FileBlockEntity } from "../../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../../entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "../../../../entity/#organization/file/fileVersion.entity";
import { getPathVolume } from "../file.volume.utils";
import { fileDBUpdateVersion } from "./file.db.update.utils";

// маска для идентификации файловых блоков (для удаления)
export interface IFileBlockMask {
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
}

/********************************************
 * БД: удалить файловый блок по маске
 * сами файлы не удаляются
 * @return - список путей к файлам
 ********************************************/
export const fileDBDeleteBlockMask = async ({
  manager,
  mask,
}: {
  manager: EntityManager;
  mask: IFileBlockMask;
}): Promise<string[]> => {
  // найти записи
  const fileBlockEntityList = await manager.find(FileBlockEntity, {
    relations: { FileVersions: { FileItems: true } },
    where: mask,
  });

  // получить список удаляемых файлов, удалить каскадно записи
  const filePathList: string[] = [];
  for (const fileBlockEntity of fileBlockEntityList) {
    filePathList.push(
      ...(await fileDBDeleteBlockId({
        manager: manager,
        idFileBlock: fileBlockEntity.id,
      })),
    );
  }

  return filePathList;
};

/********************************************
 * БД: удалить файловый блок по Id
 * сами файлы не удаляются
 * @return - список путей к файлам
 ********************************************/
export const fileDBDeleteBlockId = async ({
  manager,
  idFileBlock,
}: {
  manager: EntityManager;
  idFileBlock: number;
}): Promise<string[]> => {
  // найти запись
  const fileBlockEntity = await manager.findOneOrFail(FileBlockEntity, {
    relations: { FileVersions: { FileItems: true } },
    where: { id: idFileBlock },
  });

  // получить список удаляемых файлов
  const filePathList: string[] = [];
  for (const fileVersionsEntity of await fileBlockEntity.FileVersions) {
    for (const fileItemsEntity of await fileVersionsEntity.FileItems) {
      filePathList.push(
        getPathVolume(
          manager.connection.options.database as string,
          fileItemsEntity.date_create,
          fileItemsEntity.volume,
        ),
      );
    }
  }

  // удалить каскадно записи
  await manager.delete(FileBlockEntity, { id: idFileBlock });

  return filePathList;
};

/********************************************
 * БД: удалить версию файла
 * ЕСЛИ ВЕРСИЯ ЕДИНСТВЕННАЯ - УДАЛИТЬ БЛОК ЦЕЛИКОМ
 * @return - список путей к файлам
 ********************************************/
export const fileDBDeleteVersion = async ({
  manager,
  idFileVersion,
}: {
  manager: EntityManager;
  idFileVersion: number;
}): Promise<string[]> => {
  // найти запись
  const fileVersionEntity = await manager.findOneOrFail(FileVersionEntity, {
    relations: { FileBlock: true, FileItems: true },
    where: { id: idFileVersion },
  });

  // если одна версия - удалить файловый блок целиком
  const fileBlockEntity = await fileVersionEntity.FileBlock;
  if (fileBlockEntity.file_version_count == 1) {
    return fileDBDeleteBlockId({
      manager,
      idFileBlock: fileBlockEntity.id,
    });
  }

  // получить список удаляемых файлов
  const filePathList: string[] = [];
  for (const fileItemsEntity of await fileVersionEntity.FileItems) {
    filePathList.push(
      getPathVolume(
        manager.connection.options.database as string,
        fileItemsEntity.date_create,
        fileItemsEntity.volume,
      ),
    );
  }

  // удалить каскадно записи
  await manager.delete(FileVersionEntity, { id: idFileVersion });

  // обновить главную версию файла
  await fileDBUpdateVersion({
    manager: manager,
    idFileBlock: fileBlockEntity.id,
  });

  return filePathList;
};

/********************************************
 * БД: удалить зависимый файл
 * @param manager
 * @param idFileVersion
 * @param main - true (главный файл), false (зависимый файл)
 * @return - список путей к файлам
 ********************************************/
export const fileDBDeleteItem = async ({
  manager,
  idFileVersion,
  main,
}: {
  manager: EntityManager;
  idFileVersion: number;
  main: boolean;
}): Promise<string> => {
  // найти запись
  const fileVersionEntity = await manager.findOneOrFail(FileVersionEntity, {
    relations: { FileItems: true },
    where: { id: idFileVersion },
  });

  // путь к удаляемому файлу
  const fileItemEntity = main ? fileVersionEntity.FileItemMain : fileVersionEntity.FileItemDepend;
  const filePath = getPathVolume(
    manager.connection.options.database as string,
    fileItemEntity.date_create,
    fileItemEntity.volume,
  );

  // удалить каскадно записи
  await manager.delete(FileItemEntity, { id: fileItemEntity.id });

  return filePath;
};
