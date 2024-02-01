import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource, EntityManager, Repository } from "typeorm";

import "dotenv/config";

import { customError, setErrorGQL, setErrorRest } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { DocEntity } from "../../../../entity/#organization/doc/doc.entity";
import { FileBlockEntity } from "../../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../../entity/#organization/file/fileItem.entity";
import { FileCreateService } from "../../../file/fileCreate/fileCreate.service";
import { bufferToStream } from "../../../file/utils/file.common.utils";
import { writeFileRest } from "../../../file/utils/file.rest.utils";
import { REPORT, getReportDocFileResult, getReportDocPathTemplate } from "../../report.const";
import { docxOrg } from "../reportWord.util";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

@Injectable()
export class ReportWordDocService {
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly docRepository: Repository<DocEntity>;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(FileCreateService)
    private readonly fileCreateService: FileCreateService,
  ) {
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
  }

  /********************************************
   * СОЗДАТЬ РКК ДОКУМЕНТА В ПОТОК
   * @param res - При отстуствии ф-ция возвращает стрим, если присутствует - отправляет буфер как файл пользователю
   ********************************************/
  async reportDocStream(args: { emp_id: number; doc_id: number; res?: any }): Promise<any> {
    const { emp_id, doc_id, res } = args;
    try {
      const docEntity = await this.docRepository.findOne({
        where: {
          id: doc_id,
          del: false,
          temp: false,
        },
      });
      if (!docEntity) customError("Не найден документ с id: " + doc_id);

      // сформировать отчет
      return docxOrg({
        template: {
          path: getReportDocPathTemplate(docEntity.cls_id),
        },
        data: {
          doc: docEntity,
        },
        dataSource: this.dataSource,
        cb: (buffer) => {
          if (!res) {
            return  bufferToStream(buffer);
          }
          // отправить буфер как файл
          return writeFileRest({
            res: res,
            stream: bufferToStream(buffer),
            fileName: getReportDocFileResult(doc_id),
          });
        },
      });
    } catch (err) {
      setErrorRest({
        msg: "Ошибка создания ркк документа: doc_id=" + doc_id,
        err: err,
        res: res,
      });
    }
  }

  /********************************************
   * СОЗДАТЬ РКК ДОКУМЕНТА: ФИНАЛЬНУЮ
   * ( СОЗДАТЬ И ЗАРЕГИСТРИРОВАТЬ ФАЙЛ КАРТОЧКИ )
   ********************************************/
  async reportDocFile(args: {
    token: IToken;
    doc_id: number;
    manager?: EntityManager;
  }): Promise<FileBlockEntity | HttpException> {
    const { token, doc_id, manager } = args;
    try {
      // найти документ
      const dat = {
        where: {
          id: doc_id,
          del: false,
          temp: false,
        },
        relations: {
          Cls: true,
          jobslink: {
            Exec_job: true,
          },
        },
      };
      const docEntity = manager
        ? await manager.findOne(DocEntity, dat)
        : await this.docRepository.findOne(dat);
      if (!docEntity) customError("Не найден документ с id: " + doc_id);

      // сформировать отчет
      const fileItemEntity = (await docxOrg({
        template: {
          path: getReportDocPathTemplate(docEntity.cls_id),
        },
        data: {
          doc: docEntity,
        },
        dataSource: this.dataSource,
        cb: async (buffer) => {
          // зарегистрировать файл, созданный из потока. Старый файловый блок удалить
          const fileItemEntityList = await this.fileCreateService.createFileMain({
            files: [
              {
                stream: bufferToStream(buffer),
                originalname: REPORT.WORD.DOC.RKK.RESULT,
              },
            ],
            param: {
              idDoc: doc_id,
              rkk: true,
              pdfOnly: true, // хранить только PDF
              notifyCompleteDepend: true, // уведомить пользователя о завершении
            },
            token,
            file_block_one: true, // может быть только один файловый блок, старые файловые блоки удалить
            file_version_one: true, // признак: старые версии файла удалить
          });
          return fileItemEntityList[0];
        },
      })) as FileItemEntity;

      const fileBlockEntity = await (await fileItemEntity.FileVersion).FileBlock;
      return fileBlockEntity;
    } catch (err) {
      return setErrorGQL(REPORT.ERR + "создания для документа с id: " + doc_id, err);
    }
  }
}
