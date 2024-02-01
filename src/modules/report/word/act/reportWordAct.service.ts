import { Inject, Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import "dotenv/config";

import { customError, setErrorRest } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { ActEntity } from "../../../../entity/#organization/act/act.entity";
import { bufferToStream } from "../../../file/utils/file.common.utils";
import { writeFileRest } from "../../../file/utils/file.rest.utils";
import { getReportActFileResult, getReportActPathTemplate } from "../../report.const";
import { docxOrg } from "../reportWord.util";

@Injectable()
export class ReportWordActService {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  /********************************************
   * ПРОСМОТРЕТЬ АКТ УНИЧТОЖЕНИЯ ДЕЛ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  async reportActDelStream(args: { emp_id: number; act_id: number; res: any }): Promise<any> {
    const { emp_id, act_id, res } = args;
    try {
      const actEntity = await this.dataSource.manager.findOne(ActEntity, {
        where: {
          id: act_id,
          del: false,
        },
      });
      if (!actEntity) customError("Не найден акт с id: " + act_id);

      // сформировать отчет
      return docxOrg({
        template: {
          path: getReportActPathTemplate(),
        },
        data: {
          act: actEntity,
        },
        dataSource: this.dataSource,
        cb: (buffer) => {
          // отправить буфер как файл
          return writeFileRest({
            res: res,
            stream: bufferToStream(buffer),
            fileName: getReportActFileResult(act_id),
          });
        },
      });
    } catch (err) {
      setErrorRest({
        msg: "Ошибка создания акта уничтожения: act_id=" + act_id,
        err: err,
        res: res,
      });
    }
  }
}
