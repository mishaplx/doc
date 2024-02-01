import "dotenv/config";

import { Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { onlyUpFirst, toUpFirst } from "src/common/utils/utils.text";
import { parseXml } from "src/common/utils/utils.xml";
import { DocPackageEntity } from "src/entity/#organization/docPackage/docPackage.entity";
import { SignEntity } from "src/entity/#organization/sign/sign.entity";
import { getInnerInventory } from "src/modules/docPackage/docPackage.utils";
import { DataSource } from "typeorm";

import { customError, setErrorRest } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { bufferToStream } from "../../../file/utils/file.common.utils";
import { writeFileRest } from "../../../file/utils/file.rest.utils";
import {
  getReportInnerInventoryFileResult,
  getReportInnerInventoryPathTemplate,
} from "../../report.const";
import { docxOrg } from "../reportWord.util";

@Injectable()
export class ReportWordInnerInventoryService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  /********************************************
   * ПРОСМОТРЕТЬ ВНУТРЕННЮЮ ОПИСЬ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  async reportInnerInventoryStream(args: { id: number; res: any; token: IToken }): Promise<any> {
    const { id, res, token } = args;
    try {
      if (!id) {
        customError("id отсутствует");
      }
      const docPackage = await await this.dataSource.manager.findOne(DocPackageEntity, {
        relations: { FileBlock: { FileVersionMain: true } },
        select: { Nomenclature: { index: true } },
        where: { id },
      });
      const docPackageIndex = (await docPackage.Nomenclature).index;
      if (!docPackageIndex) customError("Не найдено дело с id: " + id);

      const xmlInnerInventory = await getInnerInventory(token.url, docPackage);
      const xmlObj = await parseXml(xmlInnerInventory);
      const { InnerInventory } = xmlObj;
      let ListElectronicDocuments =
        InnerInventory?.ListElectronicDocuments?.[0]?.ElectronicDocument;
      // Сортировка документов в деле по номеру
      ListElectronicDocuments = ListElectronicDocuments.sort((a, b) => {
        if (+a.NumEDinArch > +b.NumEDinArch) {
          return 1;
        }
        if (+a.NumEDinArch < +b.NumEDinArch) {
          return -1;
        }
        return 0;
      });
      const createTs = ListElectronicDocuments.filter((e) => e?.CreateTs?.[0]).map((e) =>
        dayjs(e.CreateTs[0], "YYYY-MM-DD hh:mm:ss").year(),
      );
      const beginYear = Math.min(...createTs);

      const ed = ListElectronicDocuments.map((e) => {
        return {
          numEDinArch: e?.NumEDinArch?.[0],
          createTs: e?.CreateTs?.[0] ? dayjs(e?.CreateTs?.[0]).format("DD.MM.YYYY") : "",
          title: e?.Title?.[0],
          countFileED: e?.CountFileED?.[0],
          volumeFileDocument: e?.VolumeFileDocument?.[0],
          hashED: e?.HashED?.[0],
          noteED: e?.NoteED?.[0],
        };
      });

      const file = await (await docPackage?.FileBlock)?.FileVersionMain;
      const fileItemEntity = file.FileItemMain;

      const sign = await this.dataSource.manager.findOne(SignEntity, {
        relations: { Emp: { User: { Staff: true }, post: true } },
        where: { file_item_id: fileItemEntity.id },
      });

      const position = (await (await sign?.Emp)?.post)?.nm || "";
      const dateSign = sign?.date_create ? dayjs(sign.date_create).format("DD.MM.YYYY") : "";
      const Staff = await (await (await sign?.Emp)?.User)?.Staff;
      const ln = Staff?.ln ? toUpFirst({ str: Staff.ln }) : "";
      const mn = Staff?.mn ? `${onlyUpFirst({ str: Staff.mn })}.` : "";
      const nm = Staff?.nm ? `${onlyUpFirst({ str: Staff.nm })}.` : "";
      const fio = `${nm}${mn}${ln}`;
      // сформировать отчет
      return docxOrg({
        template: {
          path: getReportInnerInventoryPathTemplate(),
        },
        data: {
          index: docPackageIndex,
          beginYear: beginYear,
          countDoc: InnerInventory?.CountDoc?.[0],
          countFile: InnerInventory?.CountFile?.[0],
          countVolumeDoc: InnerInventory?.CountVolumeDoc?.[0],
          ed: ed,
          position: position,
          fio: fio,
          dateSign: dateSign,
        },
        dataSource: this.dataSource,
        cb: (buffer) => {
          // отправить буфер как файл
          return writeFileRest({
            res: res,
            stream: bufferToStream(buffer),
            fileName: getReportInnerInventoryFileResult(id),
          });
        },
      });
    } catch (err) {
      setErrorRest({
        msg: "Ошибка создания внутренней описи: id дела=" + id,
        err: err,
        res: res,
      });
    }
  }
}
