import "dotenv/config";

import { Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { DataSource, In, Repository } from "typeorm";

import { DATA_SOURCE } from "../database/datasource/tenancy/tenancy.symbols";
import { AttributiveSearchElementEntity } from "../entity/#organization/attributive-search/attributive_search_element.entity";
import { DocEntity } from "../entity/#organization/doc/doc.entity";
import { FileBlockEntity } from "../entity/#organization/file/fileBlock.entity";
import { FileVersionEntity } from "../entity/#organization/file/fileVersion.entity";
import { JobEntity } from "../entity/#organization/job/job.entity";
import { ProjectEntity } from "../entity/#organization/project/project.entity";
import { DocViewEntity } from "../entity/#organization/views/docView.entity";
import { wLogger } from "../modules/logger/logging.module";
import { comparisonSigns, entityAttributes } from "./search.const";

@Injectable()
export class SearchService {
  private readonly fileVersionRepository: Repository<FileVersionEntity>;
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly docRepository: Repository<DocEntity>;
  private readonly docViewRepository: Repository<DocViewEntity>;
  private readonly projectRepository: Repository<ProjectEntity>;
  private readonly jobRepository: Repository<JobEntity>;
  private readonly attributesEntity: Repository<AttributiveSearchElementEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.fileVersionRepository = dataSource.getRepository(FileVersionEntity);
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.docRepository = dataSource.getRepository(DocEntity);
    this.docViewRepository = dataSource.getRepository(DocViewEntity);
    this.projectRepository = dataSource.getRepository(ProjectEntity);
    this.jobRepository = dataSource.getRepository(JobEntity);
    this.attributesEntity = dataSource.getRepository(AttributiveSearchElementEntity);
  }

  formatDate(inputDate): string {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async fullTextSearch(
    text: string,
    tdoc: number,
    kdoc: number,
    from: Date,
    to: Date,
    isAllWords: boolean,
    isFileNames: boolean,
    inDocuments: boolean,
    inJobs: boolean,
    inProjects: boolean,
  ): Promise<FileVersionEntity[]> {
    try {
      const IDArray: Array<number> = [];
      const BlockIDArray: Array<number> = [];
      let and = "AND doc.del=false";
      let andProjects = "AND projects.del=false AND projects.temp=false";
      let andJobs = "AND jobs.del=false";
      if (tdoc) and += `AND doc.tdoc=${tdoc}`;
      if (kdoc) and += `AND doc.cls_id=${kdoc}`;
      // дата документов
      if (from && to)
        and += ` AND doc.dtc::DATE >= '${new Date(
          from,
        ).toISOString()}' AND doc.dtc::DATE <= '${this.formatDate(to)}'`;
      else if (from && !to) and += ` AND doc.dtc::DATE >= '${this.formatDate(from)}'`;
      else if (!from && to) and += ` AND doc.dtc::DATE <= '${this.formatDate(to)}'`;
      // дата проектов
      if (from && to)
        andProjects += ` AND projects.dtc::DATE >= '${this.formatDate(
          from,
        )}' AND projects.dtc::DATE <= '${this.formatDate(to)}'`;
      else if (from && !to) andProjects += ` AND projects.dtc::DATE >= '${this.formatDate(from)}'`;
      else if (!from && to) andProjects += ` AND projects.dtc::DATE <= '${this.formatDate(to)}'`;
      // дата джобсов
      if (from && to)
        andJobs += ` AND jobs.dtc::DATE >= '${this.formatDate(
          from,
        )}' AND jobs.dtc::DATE <= '${this.formatDate(to)}'`;
      else if (from && !to) andJobs += ` AND jobs.dtc::DATE >= '${this.formatDate(from)}'`;
      else if (!from && to) andJobs += ` AND jobs.dtc::DATE <= '${this.formatDate(to)}'`;

      // танцы с бубном
      text = text.replaceAll("  ", " ");
      if (isAllWords) text = text.replaceAll(" ", " & ");
      else text = text.replaceAll(" ", " | ");
      text = text.trim();
      if (text.charAt(text.length - 1) === "|" || text.charAt(text.length - 1) === "&") {
        text = text.substring(0, text.length - 1);
        text = text.trim();
      }
      // искать в документах
      let field = "content";
      if (isFileNames) field = "name";
      if (inDocuments) {
        const foundFilesDocs = await this.fileVersionRepository.query(
          `SELECT
             version.*,
             ts_rank(to_tsvector(SUBSTRING(version.${field} FROM 1 FOR 100000)), to_tsquery('${text}')) AS rank
           FROM sad.file_version version
                  JOIN sad.file_block block ON block.id = version.file_block_id
                  JOIN sad.doc doc ON block.doc_id = doc.id ${and}
           WHERE to_tsvector(SUBSTRING(version.${field} FROM 1 FOR 100000)) @@ to_tsquery('${text}')
           ORDER BY rank DESC;`,
        );
        for (const file of foundFilesDocs) {
          IDArray.push(file.id);
          BlockIDArray.push(file.file_block_id);
        }
      }

      if (!kdoc && !tdoc) {
        // искать в джобсах
        if (inJobs) {
          const foundFilesJobs = await this.fileVersionRepository.query(
            `SELECT
             version.*,
             ts_rank(to_tsvector(SUBSTRING(version.${field} FROM 1 FOR 100000)), to_tsquery('${text}')) AS rank
             FROM sad.file_version version
             JOIN sad.file_block block ON block.id = version.file_block_id
             JOIN sad.jobs jobs ON block.job_id = jobs.id ${andJobs}
             WHERE to_tsvector(SUBSTRING(version.${field} FROM 1 FOR 100000)) @@ to_tsquery('${text}')
            ORDER BY rank DESC;`,
          );
          for (const file of foundFilesJobs) {
            IDArray.push(file.id);
            BlockIDArray.push(file.file_block_id);
          }
        }

        // искать в проектах
        if (inProjects) {
          const foundFilesProjects = await this.fileVersionRepository.query(
            `SELECT
             version.id AS id, version.file_block_id AS file_block_id,
             ts_rank(to_tsvector(SUBSTRING(version.${field} FROM 1 FOR 100000)), to_tsquery('${text}')) AS rank
             FROM sad.file_version version
             JOIN sad.file_block block ON block.id = version.file_block_id
             JOIN sad.projects projects ON block.project_id = projects.id ${andProjects}
             WHERE to_tsvector(SUBSTRING(version.${field} FROM 1 FOR 100000)) @@ to_tsquery('${text}')
            ORDER BY rank DESC;`,
          );
          for (const file of foundFilesProjects) {
            IDArray.push(file.id);
            BlockIDArray.push(file.file_block_id);
          }
        }
      }
      const versionResult = await this.fileVersionRepository.find({
        where: { id: In(IDArray) },
        relations: { FileBlock: { Doc: true, Project: true, Job: true } },
      });
      const latestVersionsMap = new Map();
      versionResult.forEach((version) => {
        const { file_block_id, version: currentVersion } = version;
        const existingVersion = latestVersionsMap.get(file_block_id);
        if (!existingVersion || currentVersion > existingVersion.version) {
          latestVersionsMap.set(file_block_id, version);
        }
      });
      return Array.from(latestVersionsMap.values());
    } catch (e) {
      wLogger.error(e);
    }
  }
  // атрибутивный поиск документов
  async attributiveDocSearch(request: string): Promise<DocViewEntity[]> {
    const IDArray: Array<number> = [];
    const condition = await this.getConditionForAttributiveSearch(request, "doc");
    const conditionFile = await this.getConditionForAttributiveSearch(request, "file");
    if (conditionFile) {
      const foundDocsFile = await this.docRepository.query(`
    SELECT doc_id
    FROM sad.file
    WHERE id IS NOT NULL${conditionFile}`);
      for (const doc of foundDocsFile) {
        IDArray.push(doc.doc_id);
      }
    }
    if (condition) {
      const foundDocs = await this.docRepository.query(`
    SELECT id
    FROM sad.doc
    WHERE del=false${condition}`);
      for (const doc of foundDocs) {
        IDArray.push(doc.id);
      }
    }
    return await this.docViewRepository.find({ where: { id: In(IDArray) } });
  }
  // атрибутивный поиск проектов
  async attributiveProjectSearch(request: string): Promise<ProjectEntity[]> {
    const condition = await this.getConditionForAttributiveSearch(request, "projects");
    const IDArray: Array<number> = [];
    if (condition) {
      const foundProjects = await this.projectRepository.query(`
    SELECT id
    FROM sad.projects
    WHERE del=false${condition}`);
      for (const project of foundProjects) {
        IDArray.push(project.id);
      }
    }
    return await this.projectRepository.find({
      where: { id: In(IDArray), del: false },
    });
  }
  // атрибутивный поиск поручений
  async attributiveJobSearch(request: string): Promise<JobEntity[]> {
    const condition = await this.getConditionForAttributiveSearch(request, "jobs");
    const condition_exec = await this.getConditionForAttributiveSearch(request, "exec_job");
    const condition_control = await this.getConditionForAttributiveSearch(request, "job_control");
    let foundJobs = null;
    let foundExecJob = null;
    let foundControlJob = null;
    const IDArray: Array<number> = [];
    if (condition) {
      foundJobs = await this.jobRepository.query(`
    SELECT id
    FROM sad.jobs
    WHERE del=false AND temp=false${condition}`);
      for (const job of foundJobs) {
        IDArray.push(job.id);
      }
    }
    if (condition_exec) {
      foundExecJob = await this.jobRepository.query(`
    SELECT job_id
    FROM sad.exec_job
    WHERE id IS NOT NULL${condition_exec}`);
      for (const job of foundExecJob) {
        IDArray.push(job.job_id);
      }
    }
    if (condition_control) {
      foundControlJob = await this.jobRepository.query(`
    SELECT job_id
    FROM sad.job_control
    WHERE id IS NOT NULL${condition_control}`);
      for (const job of foundControlJob) {
        IDArray.push(job.job_id);
      }
    }
    return await this.jobRepository.find({
      where: { id: In(IDArray), del: false },
    });
  }
  // получение атрибутов
  async getAttributes(entity: string): Promise<AttributiveSearchElementEntity[]> {
    let arrayToFind: Array<string> = [];
    if (!entity)
      return await this.attributesEntity.find({
        order: { name: "ASC" },
      });
    if (entity === entityAttributes.jobs)
      arrayToFind = [entityAttributes.jobs, entityAttributes.execJob, entityAttributes.jobControl];
    else if (entity === entityAttributes.doc)
      arrayToFind = [entityAttributes.doc, entityAttributes.file];
    if (arrayToFind.length > 0) {
      return await this.attributesEntity.find({
        where: { db_table_name: In(arrayToFind), del: false },
        order: { name: "ASC" },
      });
    }
    return await this.attributesEntity.find({
      where: { db_table_name: entity, del: false },
      order: { name: "ASC" },
    });
  }

  valueIsDate(value): boolean {
    const regex = /^([a-z]{3})\s([a-z]{3})\s(\d{2})\s(\d{4})$/i;
    const match = value.toString().match(regex);
    return !!match;
  }

  async getConditionForAttributiveSearch(request: string, entity: string): Promise<string> {
    let object = null;
    try {
      object = JSON.parse(request);
    } catch {
      return;
    }
    const attributes = await this.attributesEntity.find({
      where: { db_table_name: entity, del: false },
    });
    let condition = "";
    const dataCount = object.data.length;
    for (let i = 0; i < dataCount; i++) {
      const currentObject = object.data[i];
      const attribute = attributes.find((x) => x.id === currentObject.id);
      if (attribute) {
        if (currentObject.action === comparisonSigns.equals) {
          if (this.valueIsDate(currentObject.value))
            condition += ` ${currentObject.type} date_trunc('day', ${attribute.db_column_name})='${currentObject.value}'`;
          else
            condition += ` ${currentObject.type} ${attribute.db_column_name}='${currentObject.value}'`;
        }
        if (currentObject.action === comparisonSigns.more) {
          if (this.valueIsDate(currentObject.value)) {
            const date = new Date(currentObject.value);
            let valueAsDate = dayjs(date);
            valueAsDate = valueAsDate.add(1, "day");
            condition += ` ${currentObject.type} ${attribute.db_column_name}>'${valueAsDate.format(
              "ddd MMM DD YYYY",
            )}'`;
          } else
            condition += ` ${currentObject.type} ${attribute.db_column_name}>'${currentObject.value}'`;
        }
        if (currentObject.action === comparisonSigns.less) {
          if (this.valueIsDate(currentObject.value)) {
            const date = new Date(currentObject.value);
            let valueAsDate = dayjs(date);
            valueAsDate = valueAsDate.subtract(1, "day");
            condition += ` ${currentObject.type} ${attribute.db_column_name}<'${valueAsDate.format(
              "ddd MMM DD YYYY",
            )}'`;
          } else
            condition += ` ${currentObject.type} ${attribute.db_column_name}<'${currentObject.value}'`;
        }
        if (currentObject.action === comparisonSigns.notEqual) {
          if (this.valueIsDate(currentObject.value))
            condition += ` ${currentObject.type} date_trunc('day', ${attribute.db_column_name})!='${currentObject.value}'`;
          else
            condition += ` ${currentObject.type} ${attribute.db_column_name}!='${currentObject.value}'`;
        }
        if (currentObject.action === comparisonSigns.moreOrEquals) {
          if (this.valueIsDate(currentObject.value)) {
            condition += ` ${currentObject.type} date_trunc('day', ${attribute.db_column_name})>='${currentObject.value}'`;
          } else
            condition += ` ${currentObject.type} ${attribute.db_column_name}>='${currentObject.value}'`;
        }
        if (currentObject.action === comparisonSigns.lessOrEquals) {
          if (this.valueIsDate(currentObject.value)) {
            condition += ` ${currentObject.type} date_trunc('day', ${attribute.db_column_name})<='${currentObject.value}'`;
          } else
            condition += ` ${currentObject.type} ${attribute.db_column_name}<='${currentObject.value}'`;
        }
        if (currentObject.action === comparisonSigns.contains) {
          condition += ` ${currentObject.type} ${attribute.db_column_name} ILIKE '%${currentObject.value}%'`;
        }
        if (currentObject.action === comparisonSigns.notContains) {
          condition += ` ${currentObject.type} ${attribute.db_column_name} NOT ILIKE '%${currentObject.value}%'`;
        }
      }
    }
    return condition;
  }
}
