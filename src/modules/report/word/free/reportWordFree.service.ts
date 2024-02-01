import { Inject, Injectable } from "@nestjs/common";
import * as fs from "fs";
import { DataSource, Repository } from "typeorm";
const utf8 = require("utf8");

import "dotenv/config";

import { Readable } from "stream";
import { customError, setErrorRest } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../../../entity/#organization/doc/doc.entity";
import { FileItemEntity } from "../../../../entity/#organization/file/fileItem.entity";
import { JobEntity } from "../../../../entity/#organization/job/job.entity";
import { ProjectEntity } from "../../../../entity/#organization/project/project.entity";
import { bufferToStream } from "../../../file/utils/file.common.utils";
import { writeFileRest } from "../../../file/utils/file.rest.utils";
import { getPathVolume, readFileVolume } from "../../../file/utils/file.volume.utils";
import { docxOrg } from "../reportWord.util";
import { reportWordFreeDto } from "./reportWordFree.dto";

@Injectable()
export class ReportWordFreeService {
  private readonly fileItemRepository: Repository<FileItemEntity>;
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.fileItemRepository = dataSource.getRepository(FileItemEntity);
  }

  /********************************************
   * СОЗДАТЬ ФАЙЛ ИЗ ЗАГРУЖАЕМОГО ШАБЛОНА
   ********************************************/
  async reportFreeDemo(args: {
    files: Express.Multer.File[];
    emp_id: number;
    body: reportWordFreeDto;
    res: any;
  }): Promise<any> {
    const { files, body, res } = args;
    try {
      // ключи должны совпадать с названиями таблиц
      const data: {
        projects?: ProjectEntity;
        doc?: DocEntity;
        jobs?: JobEntity;
        params?: string;
      } = {};
      data.params = JSON.parse(body.params);
      if (body.project_id) {
        data.projects = await this.dataSource.manager.findOne(ProjectEntity, {
          where: {
            id: body.project_id,
            del: false,
          },
        });
        if (!data.projects) customError("Не найден проект с id: " + body.project_id);
      }
      if (body.doc_id) {
        data.doc = await this.dataSource.manager.findOne(DocEntity, {
          where: {
            id: body.doc_id,
            del: false,
          },
        });
        if (!data.doc) customError("Не найден документ с id: " + body.doc_id);
      }
      if (body.job_id) {
        data.jobs = await this.dataSource.manager.findOne(JobEntity, {
          where: {
            id: body.job_id,
            del: false,
          },
        });
        if (!data.jobs) customError("Не найдено поручение с id: " + body.job_id);
      }
      let buffer;
      let fileName;
      if (files && files.length > 0) {
        buffer = files[0].buffer;
        fileName = files[0].originalname;
      } else if (body.file_item_id) {
        const fileItemEntity = await this.fileItemRepository.findOne({
          relations: ["FileVersion"],
          where: { id: body.file_item_id },
        });
        const org = this.dataSource.options.database as string;
        const path = getPathVolume(org, fileItemEntity.date_create, fileItemEntity.volume);
        const stream = await readFileVolume({
          filePath: path,
          compress: fileItemEntity.compress,
          isProxy: true,
        });
        buffer = await this.streamToBuffer(stream);
        fileName = `${(await fileItemEntity.FileVersion).name}.docx`;
      }

      // сформировать отчет
      return docxOrg({
        template: {
          buffer,
        },
        data: data,
        dataSource: this.dataSource,
        cb: (buffer) => {
          // отправить буфер как файл
          return writeFileRest({
            res: res,
            stream: bufferToStream(buffer),
            fileName,
          });
        },
      });
    } catch (err) {
      setErrorRest({
        msg: "Ошибка создания файла",
        err: err,
        res: res,
      });
    }
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const bufferArray: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => {
        bufferArray.push(chunk);
      });
      stream.on("end", () => {
        const buffer = Buffer.concat(bufferArray);
        resolve(buffer);
      });
      stream.on("error", (err: Error) => {
        reject(err);
      });
    });
  }
}
