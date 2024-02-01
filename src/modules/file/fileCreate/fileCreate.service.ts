import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import "dotenv/config";

import { httpExceptErr } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { fileCreateDto, fileDateDto } from "./fileCreate.dto";
import { createFileMainUtil } from "./fileCreate.utils";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

@Injectable()
export class FileCreateService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) { }

  /********************************************
   * БД: ЗАРЕГИСТРИРОВАТЬ ГЛАВНЫЙ ФАЙЛ
   * (вызов из uploadFile)
   * @param files - если список файлов - то каждый файл в новый блок
   * @param param.idFileBlock - если задан - создать новую версию, иначе создать новый блок/версию
   * @param file_block_one - признак: у объекта+param.rkk возможен только один файловый блок, т.е. старые файловые блоки удалить
   * @param file_version_one - признак: старые версии файла удалить
   ********************************************/
  createFileMain = async (args: {
    files: fileDateDto[];
    param: fileCreateDto;
    token?: IToken;
    file_block_one?: boolean;
    file_version_one?: boolean;
  }): Promise<FileItemEntity[] | HttpException> => {
    try {
      return this.dataSource.transaction(async (manager) => {
        return await createFileMainUtil({
          manager: manager,
          ...args,
        });
      });
    } catch (err) {
      return httpExceptErr(err);
    }
  };
}
