import { ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EntityManager, Repository } from "typeorm";
import axios from "axios";
import { Request } from "express";
import FormData from "form-data";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { getDataSourceAdmin } from "src/database/datasource/tenancy/tenancy.utils";
import { AuditOperationsEntity } from "src/entity/#organization/audit/audit-operations.entity";
import { AuditEntity } from "src/entity/#organization/audit/audit.entity";
import { DocEntity } from "src/entity/#organization/doc/doc.entity";
import { EmpEntity } from "src/entity/#organization/emp/emp.entity";
import { FileBlockEntity } from "src/entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "src/entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "src/entity/#organization/file/fileVersion.entity";
import { StaffEntity } from "src/entity/#organization/staff/staff.entity";
import { UserEntity } from "src/entity/#organization/user/user.entity";

import { UserService } from "../user/user.service";
import { AuditLibrary } from "./audit-library";
import { wLogger } from "./logging.module";

@Injectable()
class Logger {
  private auditRepository: Repository<AuditEntity>;
  private userRepository: Repository<UserEntity>;
  private staffRepository: Repository<StaffEntity>;
  private auditOperationsRepository: Repository<AuditOperationsEntity>;
  private empRepository: Repository<EmpEntity>;
  private fileItemRepository: Repository<FileItemEntity>;
  private docRepository: Repository<DocEntity>;
  private auditLibrary = new AuditLibrary();

  // Запись в аудит, вызывается в ручную из любой точки приложения
  async customLog(
    token: IToken,
    method: string,
    event: string,
    description: string,
    req: Request,
    manager: EntityManager,
  ): Promise<void> {
    try {
      if (!(await manager.findOne(AuditOperationsEntity, { where: { method, is_enabled: true } })))
        return;
      const saveParams = {
        user_id: token.user_id,
        url: "CUSTOM",
        method: "POST",
        request: null,
        dtc: new Date(),
        event,
        hash: await this.makeSomeHash(manager),
        ip: req?.socket?.remoteAddress,
        description,
        response: null,
        username: token.username,
        staff_id: token.staff_id,
      };
      await manager.save(AuditEntity, saveParams);
    } catch (e) {
      wLogger.error(e);
    }
  }

  // Запись в аудит скачивание\загрузка файла
  async logFileOperation(
    token: IToken,
    req: Request,
    manager: EntityManager,
    operation = "download",
    idFileItem?: number,
    idFileBlock?: number,
    idFileVersion?: number,
  ): Promise<void> {
    try {
      let fileBlock: FileBlockEntity;
      if (idFileItem) {
        const fileItem = await manager.findOne(FileItemEntity, {
          where: { id: idFileItem },
          relations: ["FileVersion.FileBlock"],
        });
        fileBlock = await (await fileItem.FileVersion).FileBlock;
      } else if (idFileBlock) {
        fileBlock = await manager.findOne(FileBlockEntity, {
          where: { id: idFileBlock },
        });
      } else if (idFileVersion) {
        const fileVersion = await manager.findOne(FileVersionEntity, {
          where: { id: idFileVersion },
          relations: ["FileBlock"],
        });
        fileBlock = await fileVersion.FileBlock;
      }
      const { method, event, description } = this.makeFileOperationBody(
        fileBlock,
        operation,
        idFileItem,
      );
      await this.customLog(token, `${operation}${method}`, event, description, req, manager);
    } catch (e) {
      wLogger.error(e);
    }
  }

  makeFileOperationBody(
    fileBlock: FileBlockEntity,
    operation: string,
    idFileItem: number = undefined,
  ): { event: string; description: string; method: string } {
    let entity: string;
    let method: string;
    let id: number;
    let operationRu = "Скачивание";
    switch (operation) {
      case "upload":
        operationRu = "Загрузка";
        break;
      case "delete":
        operationRu = "Удаление";
        break;
      case "deleteBlock":
        operationRu = "Удаление блока";
        break;
    }
    if (fileBlock.doc_id) {
      entity = "документа";
      method = "FileDoc";
      id = fileBlock.doc_id;
    } else if (fileBlock.job_id) {
      entity = "поручения";
      method = "FileJob";
      id = fileBlock.job_id;
    } else if (fileBlock.project_id) {
      entity = "проекта";
      method = "FileProject";
      id = fileBlock.project_id;
    } else if (fileBlock.incmail_id) {
      entity = "письма";
      method = "FileMail";
      id = fileBlock.incmail_id;
    } else if (fileBlock.report_id) {
      entity = "отчета";
      method = "FileReport";
      id = fileBlock.report_id;
    } else if (fileBlock.project_template_id) {
      entity = "шаблона проекта";
      method = "FileProjectTemplate";
      id = fileBlock.project_template_id;
    }
    let description = `ID ${entity}: ${id}`;
    if (idFileItem && !fileBlock.report_id) description += `, ID файла: ${idFileItem}`;
    else description += `, ID файлового блока: ${fileBlock.id}`;
    const event = `${operationRu} файла ${entity}`;
    return { event, description, method };
  }

  // Запись в аудит, вызывается в Interceptor
  async logAction(context: ExecutionContext, response, isSuccessful = true): Promise<void> {
    try {
      if (response?.status > 300) isSuccessful = false;
      const args = context.getArgs();
      let req;
      let event = null;
      let description = null;
      let docId = null;
      for (const arg of args) {
        if (arg?.req) req = arg.req;
      }
      // для socket не логировать
      if (!req) return;
      let payload = undefined;

      if (response?.access_token) {
        payload = new JwtService().decode(response.access_token)["payload"];
      }
      if (!response?.access_token && req?.headers?.authorization) {
        payload = new UserService().parseJwt(req?.headers?.authorization);
      }
      const userId = payload?.user_id ?? payload?.payload?.user_id ?? null;
      const staffId = payload?.staff_id ?? payload?.payload?.staff_id ?? null;
      const username = payload?.username ?? payload?.payload?.username ?? null;
      if (!payload?.url && !payload?.payload?.url) return;
      const dataSource = await getDataSourceAdmin(payload?.url ?? payload?.payload?.url);
      this.auditRepository = dataSource.getRepository(AuditEntity);
      this.auditOperationsRepository = dataSource.getRepository(AuditOperationsEntity);
      this.staffRepository = dataSource.getRepository(StaffEntity);
      this.userRepository = dataSource.getRepository(UserEntity);
      this.empRepository = dataSource.getRepository(EmpEntity);
      this.docRepository = dataSource.getRepository(DocEntity);
      this.fileItemRepository = dataSource.getRepository(FileItemEntity);
      const name = context.getHandler()?.name;
      let url = req?.url;
      if (url === "/") {
        const operation = await this.auditOperationsRepository.findOne({
          where: { method: name, is_enabled: true },
        });
        if (!operation) return;
        url = name;
        const object = await this.auditLibrary.graphQLOperationsByName(
          name,
          event,
          description,
          docId,
          req,
          response,
          req?.body,
        );
        event = object.event;
        description = object.description;
        docId = object.docId;
        response = object.response;
        req.body = object.request;
        if (docId) {
          const doc = await this.docRepository.findOne({
            where: { id: docId },
            relations: { Cls: true },
          });
          if (doc) {
            const kindDB = await doc.Cls;
            const kind = kindDB.nm ?? "Отсутствует";
            description = `Вид: ${kind}, ID: ${docId}`;
          }
        }
      } else {
        const operation = await this.auditOperationsRepository.findOne({
          where: { method: url, is_enabled: true },
        });
        if (!operation) return;
        const object = await this.restOperationsByname(url, event, req, description);
        event = object.event;
        description = object.description;
      }
      try {
        JSON.parse(response);
      } catch (e) {
        response = null;
      }
      if (event) {
        let type = "Успешная операция";
        if (!isSuccessful) type = "Ошибка";
        try {
          const saveParams = {
            user_id: userId,
            url,
            method: req?.method,
            request: req?.body,
            dtc: new Date(),
            event,
            type,
            hash: await this.makeSomeHash(),
            ip: req?.socket?.remoteAddress,
            description,
            response,
            username,
            doc_id: docId,
            staff_id: staffId,
          };
          await this.auditRepository.save(saveParams);
        } catch (e) {
          wLogger.error(e);
        }
      }
    } catch (e) {
      console.log("Loggin Error: " + e);
    }
  }

  async restOperationsByname(
    url: string,
    event: string,
    req,
    description,
  ): Promise<{ event: string; description: string }> {
    switch (url) {
      // аудит
      case "/audit/hash":
        event = "Проверка целостности журнала аудита";
        break;
      case "/audit/download/file":
        event = "Выгрузка журнала аудита";
        break;
      case "/upload/file/job":
        event = "Загрузка файла поручения";
        break;
      case "/report/job":
        event = "Скачивание РКК поручения";
        description = `ID поручения: ${req.body.job_id}`;
        break;
      case "/report/act/del":
        event = "Скачивание акта";
        break;
      case "/upload/file/project":
        event = "Загрузка файла проекта";
        break;
      case "/upload/project-template":
        event = "Добавление шаблона проекта";
        description = `Вид документа: ${req.body.tdoc}, Наименование: ${req.body.nm}`;
        break;
      case "/projects/revision":
        event = "Возврат проекта на доработку";
        break;
      case "/report/doc":
        event = "Скачивание РКК документа";
        description = `ID документа: ${req.body.doc_id}`;
        break;
      case "/smdo/create-package-and-send":
        event = "Отправка документа по СМДО";
        break;
      case "/projects/revision":
        event = "Возврат проекта на доработку";
        description = `ID проекта: ${req.body.idProject}`;
        break;
      case "/projects/remark":
        event = "Согласование этапа проекта с замечаниями";
        description = `ID проекта: ${req.body.id}, ID этапа: ${req.body.id_stage}`;
        break;
    }
    return { event, description };
  }

  // Сгенерировать хэш
  async makeSomeHash(manager?: EntityManager): Promise<string> {
    let previousEntry: AuditEntity;
    if (manager) {
      previousEntry = await manager.findOne(AuditEntity, {
        where: {},
        order: { id: "DESC" },
      });
    } else {
      previousEntry = await this.auditRepository.findOne({
        where: {},
        order: { id: "DESC" },
      });
    }
    let hash = `FirstEntry`;
    if (previousEntry?.id) hash = `${previousEntry.id},${previousEntry.dtc.toISOString()}`;
    return this.hashCode(hash);
  }

  // Запрос на генерацию хэш
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
      console.log(e.message);
      return null;
    }
    return result.data.hash;
  }
}

export default Logger;
