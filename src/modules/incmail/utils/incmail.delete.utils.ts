import { EntityManager, In } from "typeorm";
import { customError } from "../../../common/type/errorHelper.type";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { IncmailEntity } from "../../../entity/#organization/inmail/incmail.entity";
import { deleteFileBlockIdUtil } from "../../file/fileDelete/fileDelete.utils";

/********************************************
 * ПОЧТОВЫЙ ИМПОРТ: УДАЛИТЬ ПИСЬМА
 * @param incmail_ids - id писем в почтовом импорте
 * @param delFile - удалять файлы-вложения
 ********************************************/
export const incmailDelete = async ({
  manager,
  incmail_ids,
  delete_file = false,
}: {
  manager: EntityManager;
  incmail_ids: number[];
  delete_file?: boolean;
}): Promise<boolean> => {
  try {
    // сначала удалять файлы-вложения т.к. удаление из Incmail
    // влечет каскадное удаление fileBlock, а сами файлы останутся

    // удалить файлы-вложения и ссылки на них в БД
    if (delete_file) {
      const fileBlockEntityList = await manager.find(FileBlockEntity, {
        where: {
          incmail_id: In(incmail_ids),
        },
      });
      for (const fileBlockEntity of fileBlockEntityList) {
        await deleteFileBlockIdUtil({
          manager: manager,
          idFileBlock: fileBlockEntity.id,
          user_session_id: 0, // id сессии нужно для проверки блокировки
        });
      }
    }

    // удалить запись Incmail
    await manager.delete(IncmailEntity, incmail_ids);

    return true;
  } catch (err) {
    console.error(err);
    customError("Почтовый импорт: ошибка удаления");
  }
};
