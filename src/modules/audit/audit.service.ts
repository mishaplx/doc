import "dotenv/config";

import { HttpException, Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import dayjs from "dayjs";
import * as Excel from "exceljs";
import FormData from "form-data";
import path from "path";
import process from "process";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { AuditOperationsEntity } from "src/entity/#organization/audit/audit-operations.entity";
import { StaffEntity } from "src/entity/#organization/staff/staff.entity";
import { DataSource, ILike, QueryRunner, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { customError, setErrorGQL } from "../../common/type/errorHelper.type";
import {
  globalSearchBuilderAudit,
  searchAllColumnWithoutRelation,
} from "../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { AuditEntity } from "../../entity/#organization/audit/audit.entity";
import { listPaginationData, paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { createPath } from "../file/utils/file.volume.utils";
import { wLogger } from "../logger/logging.module";
import { PaginatedAuditResponse } from "./dto/paginated-audit-response.dto";

@Injectable()
export class AuditService {
  private readonly auditRepository: Repository<AuditEntity>;
  private readonly auditOperationsRepository: Repository<AuditOperationsEntity>;
  private readonly staffRepository: Repository<StaffEntity>;
  private readonly dataSource: DataSource;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.auditRepository = dataSource.getRepository(AuditEntity);
    this.auditOperationsRepository = dataSource.getRepository(AuditOperationsEntity);
    this.staffRepository = dataSource.getRepository(StaffEntity);
  }
  async get(
    pagination: PaginationInput,
    order,
    args,
    searchField?: string,
  ): Promise<PaginatedAuditResponse | HttpException> {
    const { pageNumber, pageSize, All } = pagination;
    try {
      if (args.fio) {
        const staff = await this.staffRepository.find({
          where: [
            { nm: ILike(`%${args.fio}%`) },
            { ln: ILike(`%${args.fio}%`) },
            { mn: ILike(`%${args.fio}%`) },
          ],
        });

        delete args.fio;
        args.staff_id = [];

        for (const item of staff) {
          args.staff_id.push(item.id);
        }
      }

      if (!searchField?.trim()) {
        delete args.searchField;
        return await listPaginationData({
          repository: this.auditRepository,
          pagination: pagination,
          order: order ?? { id: "DESC" },
          filter: args,
        });
      }

      const queryBuilder = this.auditRepository.createQueryBuilder("audit");
      await globalSearchBuilderAudit(queryBuilder, searchField);

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }
      const [audit, total] = await queryBuilder.getManyAndCount();

      return paginatedResponseResult(audit, pageNumber, pageSize, total);
    } catch (e) {
      wLogger.error(e);
    }
  }

  async getOperations(
    pagination,
    order,
    args,
    searchField?: string,
  ): Promise<PaginatedAuditResponse | HttpException> {
    try {
      if (searchField?.trim()) {
        const [audit, total] = await searchAllColumnWithoutRelation(
          this.auditOperationsRepository,
          searchField,
          pagination.pageNumber,
          pagination.pageSize,
        );
        return paginatedResponseResult(audit, pagination.pageNumber, pagination.pageSize, total);
      } else {
        delete args.searchField;
        return await listPaginationData({
          repository: this.auditOperationsRepository,
          pagination: pagination,
          order: order ?? { id: "DESC" },
          filter: args,
        });
      }
    } catch (e) {
      wLogger.error(e);
    }
  }

  /**
   * GET
   */
  async getAuditEnabledOperations(): Promise<number[] | HttpException> {
    try {
      const auditOperations = await this.auditOperationsRepository.find({
        where: { is_enabled: true },
      });
      return auditOperations.map((x) => x.id);
    } catch (err) {
      return setErrorGQL("Ошибка чтения", err);
    }
  }

  /**
   * SET
   */
  async setAuditEnabledOperations(audit_operation_ids: number[]): Promise<boolean | HttpException> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const auditOperations = await manager.find(AuditOperationsEntity, {});
        for (const operation of auditOperations) {
          if (audit_operation_ids.includes(operation.id))
            await manager.save(AuditOperationsEntity, { id: operation.id, is_enabled: true });
          else await manager.save(AuditOperationsEntity, { id: operation.id, is_enabled: false });
        }
        return true;
      });
    } catch (err) {
      return setErrorGQL("Ошибка записи", err);
    }
  }

  async checkHash(): Promise<any> {
    try {
      const error = [];
      const auditEntries = await this.auditRepository.find({
        order: { id: "ASC" },
      });
      let firstEntry = true;
      for await (const [index, audit] of auditEntries.entries()) {
        if (!firstEntry) {
          const nextEntry = auditEntries[index + 1];
          let currentEntryHashFromNextEntry = null;
          const currentEntryHash = await this.hashCode(`${audit.id},${audit.dtc.toISOString()}`);
          if (nextEntry?.id) currentEntryHashFromNextEntry = nextEntry.hash;
          if (currentEntryHashFromNextEntry) {
            if (currentEntryHashFromNextEntry !== currentEntryHash)
              error.push(`Ошибка хэша между записями с ID: ${audit.id} и ${nextEntry.id}`);
          }
        }
        firstEntry = false;
      }
      return { status: 200, error };
    } catch (e) {
      wLogger.error(e);
    }
  }

  async makeSomeHash(): Promise<string> {
    const previousEntry = await this.auditRepository.findOne({
      where: {},
      order: { id: "DESC" },
    });
    let hash = `FirstEntry`;
    if (previousEntry?.id) hash = `${previousEntry.id},${previousEntry.dtc.toISOString()}`;
    return this.hashCode(hash);
  }

  async hashCode(str: string): Promise<string> {
    const data = new FormData();
    const buffer = Buffer.from(str);
    data.append("obj_file", buffer, {
      filename: "content.txt",
    });

    const config = {
      method: "post",
      url: `${process.env.SYS_URL_SIGN}/hash/belt/`,
      headers: {
        ...data.getHeaders(),
      },
      data: data,
    };
    let result;
    try {
      result = await axios(config);
    } catch (e) {
      wLogger.error(e);
      return null;
    }
    return result.data.hash;
  }
  async clearAudit(): Promise<boolean> {
    try {
      const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
      await queryRunner.query("TRUNCATE TABLE sad.audit");
      return true;
    } catch (e) {
      wLogger.error(e);
      customError(e);
    }
  }
  async getFileAudit(date_start, date_end, token: IToken, res): Promise<void> {
    await this.createExcelFile(date_start, date_end, token.url, res);
  }

  async createExcelFile(date_start, date_end, url: string, res): Promise<void> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Таблица аудит");
    worksheet.addRow([
      "Номер записи",
      "Пользователь",
      "Дата события",
      "Событие",
      "Описание",
      "Хэш",
      "IP-адрес",
      "Тип сообщения",
    ]);
    const queryBuilder = this.auditRepository.createQueryBuilder("audit");
    const convertedTimestampEnd = dayjs(date_end).endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
    const arrayAudit = await queryBuilder
      .select()
      .where(`audit.dtc >= :date_start AND audit.dtc <= :date_end`, {
        date_start: date_start,
        date_end: convertedTimestampEnd,
      })
      .orderBy({ id: "DESC" })
      .getMany();

    for (let i = 0; i < arrayAudit.length; i++) {
      //@TODO переписать на queryBuilder
      const staffName = await this.staffRepository.findOne({
        where: {
          id: arrayAudit[i].staff_id,
        },
      });

      const fullName = staffName.fullFIO;
      const date = new Date(arrayAudit[i].dtc);
      worksheet.addRow([
        arrayAudit[i].id,
        fullName,
        date,
        arrayAudit[i].event,
        arrayAudit[i].description,
        arrayAudit[i].hash,
        arrayAudit[i].ip,
        arrayAudit[i].type,
      ]);
    }

    const pathFolder = path.resolve(process.env.FILE_STAGE, url, "audit");
    const dateTime = new Date().toISOString().slice(0, 10).replace(/-/g, "") + uuidv4();
    const pathToFile = path.resolve(process.env.FILE_STAGE, url, "audit", `audit-${dateTime}.xlsx`);
    await createPath(pathFolder);
    await workbook.xlsx.writeFile(pathToFile);
    res.download(pathToFile);
  }

  async getLastDate(): Promise<Date> {
    const lastItem = await this.auditRepository.find({
      order: {
        id: "ASC",
      },
      take: 1,
    });
    return lastItem[0].dtc;
  }
}
