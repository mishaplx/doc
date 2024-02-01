import { EntityManager } from "typeorm";

import { FileBlockEntity } from "src/entity/#organization/file/fileBlock.entity";


/********************************************
 * БД: обновить главную версию и количество версий
 * @param manager
 * @param idFileBlock
 * @param idFileVersionMain - новая главная версия, иначе последняя
 ********************************************/
export const fileDBUpdateVersion = async ({
  manager,
  idFileBlock,
  idFileVersionMain,
}: {
  manager: EntityManager;
  idFileBlock: number;
  idFileVersionMain?: number;
}): Promise<void> => {
  // файловый блок
  const fileBlockEntity = await manager.findOneByOrFail(FileBlockEntity, { id: idFileBlock });

  // если главная версия не задана - определить
  if (!idFileVersionMain) {
    let version = 0;
    for (const fileVersionEntity of await fileBlockEntity.FileVersions) {
      if (version < fileVersionEntity.version) {
        version = fileVersionEntity.version;
        idFileVersionMain = fileVersionEntity.id;
      }
    }
  }

  // запомнить главную версию файла
  if (idFileVersionMain) {
    await manager.update(
      FileBlockEntity,
      { id: idFileBlock },
      { file_version_main: idFileVersionMain },
    );
  }
};
