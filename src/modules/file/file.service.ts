import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import "dotenv/config";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { resetBlockedFile } from "./utils/file.blocked.utils";
import { FileVersionEntity } from "src/entity/#organization/file/fileVersion.entity";

// const ERR = "Файлы: ошибка ";

@Injectable()
export class FileService {
  constructor(@Inject(DATA_SOURCE) readonly dataSource: DataSource) {}

  /********************************************
   * РАЗБЛОКИРОВАТЬ ДОСТУП К ФАЙЛОВОМУ БЛОКУ
   ********************************************/
  async unblockedFileBlock(args: { token: IToken; file_block_id: number }): Promise<boolean> {
    return resetBlockedFile({
      manager: this.dataSource.manager,
      file_block_id: args.file_block_id,
      token: args.token,
    });
  }

  /********************************************
   * ОТПРАВИТЬ ФАЙЛ НА ПОВТОРНУЮ КОНВЕРТАЦИЮ
   ********************************************/
  async repeatConvertation(file_version_id: number): Promise<boolean> {
    await this.dataSource.manager.update(FileVersionEntity, {
      id: file_version_id,
      task_pdf_create: true,
    },
    { fail_pdf_create: false });
    return true;
  }
}
