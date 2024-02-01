import { Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import "dotenv/config";

import { customError, setErrorGQL, setErrorRest } from "../../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../../database/datasource/tenancy/tenancy.symbols";
import { ProjectEntity } from "src/entity/#organization/project/project.entity";
import { FileBlockEntity } from "../../../../entity/#organization/file/fileBlock.entity";
import { FileCreateService } from "../../../file/fileCreate/fileCreate.service";
import { bufferToStream } from "../../../file/utils/file.common.utils";
import { writeFileRest } from "../../../file/utils/file.rest.utils";
import { getReportProjectFileResult, getReportProjectPathTemplate } from "../../report.const";
import { docxOrg } from "../reportWord.util";

@Injectable()
export class ReportWordProjectService {
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly projectRepository: Repository<ProjectEntity>;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(FileCreateService) private readonly fileCreateService: FileCreateService,
  ) {
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.projectRepository = dataSource.getRepository(ProjectEntity);
  }

  /********************************************
   * СОЗДАТЬ ОТЧЕТ ПРОЕКТА В ПОТОК
   * @param res - При отстуствии ф-ция возвращает стрим, если присутствует - отправляет буфер как файл пользователю
   ********************************************/
  async reportStream(args: {
    emp_id: number;
    project_id: number;
    // report_template_id: numer; TODO
    res?: any
}): Promise<any> {
    const { emp_id, project_id, res } = args;
    try {
      const projectEntity = await this.projectRepository.findOne({
        where: {
          id: project_id,
          del: false,
          temp: false,
        },
      });
      if (!projectEntity) customError("Не найден проект с id: " + project_id);

      // сформировать отчет
      return docxOrg({
        template: {
          path: getReportProjectPathTemplate(),
        },
        data: {
          project: projectEntity,
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
            fileName: getReportProjectFileResult(project_id),
          });
        },
      });
    } catch (err) {
      setErrorRest({
        msg: "Ошибка создания отчета: project_id=" + project_id,
        err: err,
        res: res,
      });
    }
  }
}
