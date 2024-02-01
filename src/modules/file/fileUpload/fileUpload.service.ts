import { Inject, Injectable, Scope } from "@nestjs/common";
import { DataSource } from "typeorm";

const utf8 = require("utf8");

import "dotenv/config";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import Logger from "src/modules/logger/logger";
import { ResponseType, customError, setErrorRest } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { fileCreateDto, fileDateDto } from "../fileCreate/fileCreate.dto";
import { createFileMainUtil } from "../fileCreate/fileCreate.utils";
import { bufferToStream } from "../utils/file.common.utils";

@Injectable({ scope: Scope.REQUEST })
export class FileUploadService {
  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    private logger: Logger,
  ) {}

  async uploadFile(
    args: {
      files: Express.Multer.File[];
      param: fileCreateDto;
      token: IToken;
      res: any;
      req: any;
    },
    returnResponse = true,
  ): Promise<any> {
    const { files, res } = args;
    try {
      // // проверить доступность операции
      // await accessFile({
      //   dataSource: this.dataSource,
      //   action: ACTIONS_FILE.FILE_ADD,
      //   emp_id: emp_id,
      //   doc_id: args.param.idDoc,
      //   job_id: args.param.idJob,
      //   project_id: args.param.idProject,
      //   // project_exec_id: args.param.idProjectExec,
      //   // incmail_id: args.param.idIncmail,
      //   // report_id: args.param.idReport,
      //   // act_id: args.param.IdAct,
      // });

      const fileItemsEntity = await this.uploadFileExec(args);
      for (const file of fileItemsEntity) {
        await this.logger.logFileOperation(
          args.token,
          args.req,
          this.dataSource.manager,
          "upload",
          file.id,
        );
      }

      if (!returnResponse) return fileItemsEntity;
      return res.send(
        new ResponseType(
          201,
          "",
          files.length == 1 ? "Файл загружен" : "Файлы загружены",
          fileItemsEntity.map((item) => item.id),
        ),
      );
    } catch (err) {
      setErrorRest({
        msg: "Ошибка загрузки на сервер " + (files.length > 1 ? "файлов" : "файла"),
        err: err,
        res: res,
      });
    }
  }

  async uploadFileExec(args: {
    files: Express.Multer.File[];
    param: fileCreateDto;
    token: IToken;
    file_block_one?: boolean;
    file_version_one?: boolean;
  }): Promise<FileItemEntity[]> {
    const { files, param, token, file_block_one, file_version_one } = args;
    try {
      const filesDate: fileDateDto[] = [];
      for (const file of files) {
        filesDate.push({
          stream: bufferToStream(file.buffer), // буфер в поток
          originalname: utf8.decode(file.originalname), // кодировку в порядок
        });
      }

      return await this.dataSource.transaction(async (manager) => {
        return await createFileMainUtil({
          manager: manager,
          files: filesDate,
          param: param,
          token: token,
          file_block_one: file_block_one,
          file_version_one: file_version_one,
        });
      });
    } catch (err) {
      customError("Ошибка загрузки на сервер " + (files.length > 1 ? "файлов" : "файла"), err);
    }
  }
}
