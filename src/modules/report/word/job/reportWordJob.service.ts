import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import "dotenv/config";

import { customError, setErrorRest } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { JobEntity } from "../../../../entity/#organization/job/job.entity";
import { bufferToStream } from "../../../file/utils/file.common.utils";
import { writeFileRest } from "../../../file/utils/file.rest.utils";
import { getReportJobFileResult, getReportJobPathTemplate } from "../../report.const";
import { docxOrg } from "../reportWord.util";

@Injectable()
export class ReportWordJobService {
  private readonly jobRepository: Repository<JobEntity>;

  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {
    this.jobRepository = dataSource.getRepository(JobEntity);
  }

  /********************************************
   * ПРОСМОТРЕТЬ РКК ПОРУЧЕНИЯ БЕЗ СОЗДАНИЯ ФАЙЛА
   ********************************************/
  async reportJobStream(args: { emp_id: number; job_id: number; res: any }): Promise<any> {
    const { emp_id, job_id, res } = args;
    try {
      const jobEntity = await this.jobRepository.findOne({
        where: {
          id: job_id,
          del: false,
          temp: false,
        },
      });
      if (!jobEntity) customError("Не найдено поручение с id: " + job_id);

      // сформировать отчет
      return docxOrg({
        template: {
          path: getReportJobPathTemplate(),
        },
        data: {
          job: jobEntity,
        },
        dataSource: this.dataSource,
        cb: (buffer) => {
          // отправить буфер как файл
          return writeFileRest({
            res: res,
            stream: bufferToStream(buffer),
            fileName: getReportJobFileResult(job_id),
          });
        },
      });
    } catch (err) {
      setErrorRest({
        msg: "Ошибка создания ркк поручения: job_id=" + job_id,
        err: err,
        res: res,
      });
    }
  }
}
