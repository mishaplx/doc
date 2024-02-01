import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import "dotenv/config";

import { setErrorGQL } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { fileDBListBlock, fileDBListItem } from "../utils/db/file.db.list.utils";

const ERR = "Файлы: ошибка ";

@Injectable()
export class FileListService {
  private readonly dataSource: DataSource;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  /********************************************
   * ФАЙЛЫ: ПОЛУЧИТЬ СПИСОК FILE_BLOCK
   ********************************************/
  listFileBlock = async (args: {
    ids?: number[];
    project_id?: number;
    project_exec_id?: number;
    doc_id?: number;
    job_id?: number;
    incmail_id?: number;
    report_id?: number;
    inventory_id?: number;
    doc_package_id?: number;
    act_id?: number;
    rkk?: boolean;
    project_required?: boolean;
  }): Promise<FileBlockEntity[] | HttpException> => {
    try {
      return fileDBListBlock({ ...args, dataSource: this.dataSource });
    } catch (err) {
      return setErrorGQL(ERR + "получения списка файловых блоков", err);
    }
  };

  /********************************************
   * ФАЙЛЫ: ПОЛУЧИТЬ СПИСОК FILE_ITEM
   ********************************************/
  listFileItem = async (args: {
    ids?: number[];
    ext?: string;
    main?: boolean;
    pdf_format?: string;
    task_pdf_format?: boolean;
    fail_pdf_format?: boolean;
    file_version_id?: number;
  }): Promise<FileItemEntity[] | HttpException> => {
    try {
      return fileDBListItem({ ...args, dataSource: this.dataSource });
    } catch (err) {
      return setErrorGQL(ERR + "получения списка файлов", err);
    }
  };
}
