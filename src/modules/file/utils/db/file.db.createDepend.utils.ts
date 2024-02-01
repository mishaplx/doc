import { EntityManager } from "typeorm";
import { FileItemEntity } from "../../../../entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "../../../../entity/#organization/file/fileVersion.entity";

export interface IFileDBCreateDepend {
  idFileVersion: number;
  item: {
    volume: string;
    date_create: Date;
    pdf_format?: string;
    task_pdf_format?: boolean;
    compress?: boolean;
  };
}

interface IManager {
  manager: EntityManager;
}
interface ICreateDepend extends IManager, IFileDBCreateDepend {}

/********************************************
 * БД: зарегистрировать зависимый файл
 * @param idFileBlock - если указан то регистрируется новая версия иначе регистрируется как новый файл
 ********************************************/
export const fileItemDBCreateDepend = async ({
  manager,
  idFileVersion,
  item: { volume, date_create, pdf_format = "", task_pdf_format = true, compress },
}: ICreateDepend): Promise<FileItemEntity> => {
  // найти версию файла
  const fileVersionEntity = await manager.findOneByOrFail(FileVersionEntity, {
    id: idFileVersion,
  });

  // создать item Depend
  const fileItemEntity = await manager.create(FileItemEntity, {
    file_version_id: fileVersionEntity.id,
    volume: volume,
    ext: "pdf",
    date_create: date_create,
    main: false,
    pdf_format: pdf_format,
    task_pdf_format: task_pdf_format,
    compress: compress,
  });
  await manager.save(FileItemEntity, fileItemEntity);

  return fileItemEntity;
};
