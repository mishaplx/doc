import { EntityManager } from "typeorm";
import { Incmail } from "../../../common/interfaces/incmail.interface";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { IncmailEntity } from "../../../entity/#organization/inmail/incmail.entity";
import { fileDateDto } from "../../file/fileCreate/fileCreate.dto";
import { createFileMainUtil } from "../../file/fileCreate/fileCreate.utils";
import { bufferToStream } from "../../file/utils/file.common.utils";
import { getPathVolumeEntity } from "../../file/utils/file.volume.utils";

/********************************************
 * ПОЧТОВЫЙ ИМПОРТ: СОХРАНИТЬ ПИСЬМА
 ********************************************/
export const incmailSave = async ({
  manager,
  mails,
}: {
  manager: EntityManager;
  mails: Incmail[];
}): Promise<IncmailEntity[]> => {
  const ret: IncmailEntity[] = [];
  const filesItemEntity: FileItemEntity[] = [];

  try {
    for await (const mail of mails) {
      // письмо: сохранить в БД
      let mailEntity = manager.create(IncmailEntity, mail);
      mailEntity = await manager.save(mailEntity);
      ret.push(mailEntity);

      // письмо: сохранить вложения в БД / VOLUME
      const files: fileDateDto[] = [];
      for await (const attachment of mail.attachments) {
        files.push({
          stream: bufferToStream(attachment.content),
          originalname: attachment.filename || 'document.txt',
        });
      }
      if (files.length > 0) {
        for await (const file of files) {
          const fileEntity = await createFileMainUtil({
            manager: manager,
            files: [file],
            param: { idIncmail: mailEntity.id },
          });
          filesItemEntity.push(...fileEntity);
        }
      }
    }
  } catch (err) {
    // при ошибке удалить созданные файлы, так как последует откат БД
    for (const fileItemEntity of filesItemEntity) {
      getPathVolumeEntity(manager.connection.options.database as string, fileItemEntity);
    }
    throw err;
  }
  return ret;
};
