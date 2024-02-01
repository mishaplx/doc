import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource, IsNull, Not, Repository } from "typeorm";

import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { setErrorGQL } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";

const ERR = "Файлы: ошибка ";

@Injectable()
export class FileUpdateService {
  private readonly fileVersionRepository: Repository<FileVersionEntity>;
  private readonly fileItemRepository: Repository<FileItemEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.fileVersionRepository = dataSource.getRepository(FileVersionEntity);
    this.fileItemRepository = dataSource.getRepository(FileItemEntity);
  }

  /********************************************
   * БЛОК ФАЙЛА: УБРАТЬ ПРИЗНАК ОБЯЗАТЕЛЬНОГО ФАЙЛА (ТОЛЬКО ДЛЯ ПРОЕКТОВ)
   ********************************************/
  async updateFileBlockProjectRequired(args: {
    idFileBlock: number;
  }): Promise<FileBlockEntity | HttpException> {
    const { idFileBlock } = args;
    try {
      return await this.dataSource.transaction(async (manager) => {
        await manager.update(
          FileBlockEntity,
          { id: idFileBlock, project_id: Not(IsNull()), project_required: true },
          { project_required: false },
        );
        return await manager.findOneByOrFail(FileBlockEntity, {
          id: idFileBlock,
          project_id: Not(IsNull()),
        });
      });
    } catch (err) {
      return setErrorGQL(ERR + "обновления таблицы блоков", err);
    }
  }

  /********************************************
   * ВЕРСИЯ ФАЙЛА: ОБНОВИТЬ ЗАПИСЬ
   ********************************************/
  async updateFileVersion(args: {
    idFileVersion: number;
    name?: string;
    content?: string;
    note?: string;
    task_pdf_create?: boolean;
    fail_pdf_create?: boolean;
    task_main_content?: boolean;
    fail_main_content?: boolean;
  }): Promise<FileVersionEntity | HttpException> {
    const { idFileVersion } = args;
    delete args["idFileVersion"];
    if (Object.keys(args).length == 0) return setErrorGQL(ERR + "задания аргументов");
    try {
      await this.fileVersionRepository.update({ id: idFileVersion }, args);
      return await this.fileVersionRepository.findOneByOrFail({ id: idFileVersion });
    } catch (err) {
      return setErrorGQL(ERR + "обновления таблицы версий", err);
    }
  }

}
