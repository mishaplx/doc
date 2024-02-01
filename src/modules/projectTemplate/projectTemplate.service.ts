import { HttpException, Inject, Injectable } from "@nestjs/common";
import "dotenv/config";

import { DataSource, Repository } from "typeorm";
import { customError } from "../../common/type/errorHelper.type";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../entity/#organization/file/fileItem.entity";
import { FileVersionEntity } from "../../entity/#organization/file/fileVersion.entity";
import { ProjectTemplateEntity } from "../../entity/#organization/project_template/project_template.entity";
import { listPaginationData } from "../../pagination/pagination.service";
import { deleteFileBlockIdUtil } from "../file/fileDelete/fileDelete.utils";
import { wLogger } from "../logger/logging.module";
import { PaginatedProjectTemplateResponse } from "./dto/paginated-project-template-response.dto";

@Injectable()
export class ProjectTemplateService {
  private readonly projectTemplateRepository: Repository<ProjectTemplateEntity>;
  private readonly fileVersionRepository: Repository<FileVersionEntity>;
  private readonly fileItemRepository: Repository<FileItemEntity>;
  private readonly fileBlockRepository: Repository<FileBlockEntity>;
  private readonly dataSource: DataSource;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.dataSource = dataSource;
    this.projectTemplateRepository = dataSource.getRepository(ProjectTemplateEntity);
    this.fileVersionRepository = dataSource.getRepository(FileVersionEntity);
    this.fileBlockRepository = dataSource.getRepository(FileBlockEntity);
    this.fileItemRepository = dataSource.getRepository(FileItemEntity);
  }
  async getProjectTemplates(
    pagination,
    order,
    args,
    searchField,
  ): Promise<PaginatedProjectTemplateResponse | HttpException> {
    try {
      return await listPaginationData({
        repository: this.projectTemplateRepository,
        pagination: pagination,
        order: order ?? { nm: "ASC" },
        filter: args,
      });
    } catch (e) {
      wLogger.error(e);
    }
  }

  async addProjectTemplate(
    nm: string,
    file_item_id: number,
    tdoc: number,
  ): Promise<ProjectTemplateEntity> {
    const result = await this.projectTemplateRepository.save({
      file_item_id,
      nm,
      dtc: new Date(),
      tdoc,
    });
    if (result) await this.attachTemplateToFileBlock(file_item_id, result);
    return result;
  }

  // Прикрепить FileBlock к шаблону проекта
  async attachTemplateToFileBlock(
    file_item_id: number,
    result: ProjectTemplateEntity,
  ): Promise<void> {
    const fileItem = await this.fileItemRepository.findOne({ where: { id: file_item_id } });
    const fileVersion = await this.fileVersionRepository.findOne({
      where: { id: fileItem.file_version_id },
    });
    const fileBlock = await this.fileBlockRepository.findOne({
      where: { id: fileVersion.file_block_id },
    });
    await this.fileBlockRepository.save({ id: fileBlock.id, project_template_id: result.id });
  }

  // удалить файл при удалении шаблона
  async deleteTemplateFileBlock(file_item_id: number): Promise<void> {
    try {
      const fileItem = await this.fileItemRepository.findOne({ where: { id: file_item_id } });
      const fileVersion = await this.fileVersionRepository.findOne({
        where: { id: fileItem.file_version_id },
      });
      const fileBlock = await this.fileBlockRepository.findOne({
        where: { id: fileVersion.file_block_id },
      });
      await this.dataSource.transaction(async (manager) => {
        await deleteFileBlockIdUtil({
          manager: manager,
          idFileBlock: fileBlock.id,
          user_session_id: 0,
        });
      });
    } catch (e) {
      console.log("Не удалось удалить файл шаблона проекта");
    }
  }

  async changeProjectTemplate(
    id: number,
    newNm: string,
    newTdoc: number,
  ): Promise<ProjectTemplateEntity | HttpException> {
    const existed = await this.projectTemplateRepository.findOne({ where: { id } });
    if (existed) {
      const tdoc = newTdoc || existed.tdoc;
      const nm = newNm || existed.nm;
      return this.projectTemplateRepository.save({ id: existed.id, nm, tdoc });
    }
    return customError(`Не найден шаблон проекта с ID ${id}`);
  }

  async deleteProjectTemplate(id: number): Promise<boolean | HttpException> {
    const existed = await this.projectTemplateRepository.findOne({ where: { id } });
    if (existed) {
      await this.projectTemplateRepository.delete({ id: existed.id });
      await this.deleteTemplateFileBlock(existed.file_item_id);
      return true;
    }
    return customError(`Не найден шаблон проекта с ID ${id}`);
  }
}
