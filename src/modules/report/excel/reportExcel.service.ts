import { HttpException, Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

import "dotenv/config";
import process from "process";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { customError, setErrorGQL } from "../../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { ReportEntity } from "../../../entity/#organization/report/report.entity";
import { ReportTemplateEntity } from "../../../entity/#organization/report/reportTemplate.entity";
import { UnitEntity } from "../../../entity/#organization/unit/unit.entity";
import { FileCreateService } from "../../file/fileCreate/fileCreate.service";
import { deleteFileBlockMaskUtil } from "../../file/fileDelete/fileDelete.utils";
import { bufferToStream } from "../../file/utils/file.common.utils";
import { REPORT } from "../report.const";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { toUpFirst } from "src/common/utils/utils.text";

const XLS = require("exceljs"),
  fs = require("fs"),
  path = require("path"),
  ini = require("ini"),
  pg = require("pg");

const INI_KEY = {
  CELL: "cell",
  TYPE: "type",
  TYPE_LIST: {
    PARAM: "param",
    SQL: "sql",
    DATE: "date",
    AUTHOR: {
      POST: "author.post",
      FIO: 'author.fio',
    }
  },
  FILE: "file",
  VAL: "val",
};

@Injectable()
export class ReportExcelService {
  private readonly reportRepository: Repository<ReportEntity>;
  private readonly reportTemplateRepository: Repository<ReportTemplateEntity>;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
    @Inject(FileCreateService) private readonly fileCreateService: FileCreateService,
  ) {
    this.reportRepository = dataSource.getRepository(ReportEntity);
    this.reportTemplateRepository = dataSource.getRepository(ReportTemplateEntity);
  }

  /********************************************
   * СОЗДАТЬ ОТЧЕТ СТАТИЧЕСКИЙ
   * @param pdf_only - признак: у отчета только один pdf файл
   * @param report_one - признак: у шаблона только один отчет
   ********************************************/
  async create(args: {
    token: IToken;
    report_template_id: number;
    pdf_only?: boolean;
    report_one?: boolean;
    param?: JSON;
  }): Promise<FileBlockEntity | HttpException> {
    const { token, report_template_id, pdf_only = false, report_one = false, param = {} } = args;
    const re_addr = new RegExp("^((.*)!)?(\\D+)(\\d+)$", "s");
    const RE_IND = {
      SHEET: 2,
      COL: 3,
      ROW: 4,
    };

    try {
      // путь к папке отчета из БД
      const reportTemplateEntity = await this.reportTemplateRepository.findOneOrFail({
        select: {
          path: true,
        },
        where: {
          id: report_template_id,
        },
      });
      const pathBase = path.join(REPORT.PATH, reportTemplateEntity.path);

      // базовое название файла (без расширения)
      const fileBase = REPORT.EXCEL.TEMPLATE.substring(0, REPORT.EXCEL.TEMPLATE.lastIndexOf("."));

      // путь к файлу шаблона
      const pathXLS = path.join(pathBase, REPORT.EXCEL.TEMPLATE);

      // путь к файлу настроек
      const pathINI = path.join(pathBase, fileBase + ".ini");

      // инициализировать шаблон
      const wb = new XLS.Workbook();
      await wb.xlsx.readFile(pathXLS);
      wb.created = new Date();
      wb.modified = new Date();
      wb.creator = process.env.PRODUCT + ": " + token.fio; // автор
      wb.calcProperties.fullCalcOnLoad = true; // перерасчет при открытии

      // инициализировать файл настроек
      const ini_data = ini.parse(fs.readFileSync(pathINI, "utf-8"));

      // подключиться к БД
      // параметры подключения взять с соединения TypeORM
      // FIXME: переделать на dataSource
      const options = this.dataSource.options as any;
      const pool = new pg.Pool({
        host: options.host,
        port: options.port ?? process.env.DB_PORT,
        user: options.username,
        password: options.password,
        database: options.database,
      });
      const dbClient = await pool.connect();

      // обработать каждый блок
      for (const ini_key of Object.keys(ini_data)) {
        const ini_block = ini_data[ini_key];

        // куда писать данные
        const addr = ini_block[INI_KEY.CELL]?.match(re_addr) ?? ["", "", "", "", ""];
        if (!addr[RE_IND.SHEET] || addr[RE_IND.SHEET] == "") addr[RE_IND.SHEET] = "1";
        if (addr[RE_IND.COL] == "") addr[RE_IND.COL] = "A";
        if (addr[RE_IND.ROW] == "") addr[RE_IND.ROW] = "1";
        if (!!Number(addr[RE_IND.SHEET])) addr[RE_IND.SHEET] = Number(addr[RE_IND.SHEET]);
        addr[RE_IND.COL] = addr[RE_IND.COL].toUpperCase();
        if (!!Number(addr[RE_IND.ROW])) addr[RE_IND.ROW] = Number(addr[RE_IND.ROW]);

        // заполняемый лист Excel
        const ws = wb.getWorksheet(addr[RE_IND.SHEET]);

        // вносимые данные
        let data;

        // тип ini-блока
        const block_type = ini_block[INI_KEY.TYPE];
        switch (block_type) {
          // ==================================
          // ТИП БЛОКА: PARAM
          // ==================================
          case INI_KEY.TYPE_LIST.PARAM:
            break;

          // ==================================
          // ТИП БЛОКА: SQL
          // ==================================
          case INI_KEY.TYPE_LIST.SQL:
            // прочитать SQL
            let sql = fs.readFileSync(path.join(pathBase, ini_block[INI_KEY.FILE]), "utf-8");

            // внести в запрос переменные
            for (const param_key of Object.keys(param)) {
              const val = param[param_key];
              sql = sql.replaceAll("<<" + param_key + ">>", val);
            }

            // выполнить запрос
            data = await dbClient.query(sql);

            // взять данные предпоследней команды, т.к. последняя COMMIT
            data = data?.at(-2)?.rows;

            // список словарей в список списков
            data = data.map((item) => Object.values(item));

            // записать данные
            //addr[RE_IND.COL] = xlsxColumnCharToNum(addr[RE_IND.COL]);
            await ws.insertRows(addr[RE_IND.ROW], data, "i");

            break;

          // ==================================
          // ТИП БЛОКА: DATE
          // ==================================
          case INI_KEY.TYPE_LIST.DATE:
            const val = ini_block[INI_KEY.VAL].split(".");
            if (["param", "now"].includes(val?.at(0))) {
              switch (val?.at(0)) {
                case "param":
                  data = param[val?.at(1)];
                  if (!data) customError("Не задан параметр: " + val?.at(1));
                  break;
                case "now":
                  data = undefined;
                  break;
                default:
                  customError("Неизвестный val");
              }

              // строку в дату
              data = data ? new Date(data) : new Date() ;

              // сдвинуть дату на UTC т.к. Excel также проводит коррекцию
              data = new Date(data.getTime() - new Date().getTimezoneOffset() * 60000);

              // записать данные
              ws.getCell(addr[RE_IND.COL] + addr[RE_IND.ROW]).value = data;
            }
            break;

          // ==================================
          // ТИП БЛОКА: AUTHOR.FIO
          // ==================================
          case INI_KEY.TYPE_LIST.AUTHOR.FIO:
            data = await this.dataSource.manager.findOneByOrFail(EmpEntity, { id: token.current_emp_id });
            data = await data.User;
            data = await data.Staff;
            data = data.FIO;
            ws.getCell(addr[RE_IND.COL] + addr[RE_IND.ROW]).value = data;
            break;

          // ==================================
          // ТИП БЛОКА: AUTHOR.POST
          // ==================================
          case INI_KEY.TYPE_LIST.AUTHOR.POST:
            data = await this.dataSource.manager.findOneByOrFail(EmpEntity, { id: token.current_emp_id });
            data = await data.post;
            data = toUpFirst({ str: data.nm });
            ws.getCell(addr[RE_IND.COL] + addr[RE_IND.ROW]).value = data;
            break;

          // ==================================
          // ТИП БЛОКА: НЕИЗВЕСТЕН
          // ==================================
          default:
            customError("Неизвестный тип блока");
        }
      }

      // закрыть соединение с БД
      await dbClient.end();

      // данные в буфер
      const file_buf = await wb.xlsx.writeBuffer();

      // отправить буфер как файл
      // return writeFileRest({
      //   res: res,
      //   stream: bufferToStream(file_buf),
      //   fileName: 'stat.xlsx',
      // });

      // сохранить буфер в файл
      // await wb.xlsx.writeFile(path.join(REPORT.PATH+'111.xlsx'));

      // удалить отчеты и их файлы
      if (report_one) {
        await this.dataSource.transaction(async (manager) => {
          // список id старых отчетов
          const reportEntityList = await manager.find(ReportEntity, {
            select: {
              id: true,
            },
            where: {
              report_template_id: report_template_id,
            },
          });

          for (const itemReport of reportEntityList) {
            // удалить файлы старых отчетов и ссылки на них
            await deleteFileBlockMaskUtil({
              manager: manager,
              mask: {
                report_id: itemReport.id,
              },
            });
            // удалить запись в таблице reports
            await manager.delete(ReportEntity, itemReport);
          }
        });
      }

      // заменить код подразделения на id подразделения
      const units: number[] = [];
      for await (const unit of param["units"] ?? []) {
        const { code } = await this.dataSource.manager.findOneOrFail(UnitEntity, {
          select: { code: true },
          where: { id: unit },
        });
        units.push(Number(code));
      }
      if (units.length) {
        param["units"] = units;
      }

      // создать запись в таблице отчеты
      let reportEntity = await this.reportRepository.create({
        emp_id: token.current_emp_id,
        report_template_id: report_template_id,
        param: JSON.stringify(param),
      });
      reportEntity = await this.reportRepository.save(reportEntity);

      // зарегистрировать файл, созданный из потока
      const fileItemsEntity = await this.fileCreateService.createFileMain({
        files: [
          {
            stream: bufferToStream(file_buf),
            originalname: REPORT.EXCEL.RESULT,
          },
        ],
        param: {
          idReport: reportEntity.id,
          pdfOnly: pdf_only,
          notifyCompleteDepend: true,
        },
        token,
      });
      const fileVersion = await (fileItemsEntity[0] as FileItemEntity).FileVersion;
      const fileBlock = await fileVersion.FileBlock;

      return fileBlock;
    } catch (err) {
      return setErrorGQL("Ошибка создания отчета: report_template_id=" + report_template_id, err);
    }
  }
}
