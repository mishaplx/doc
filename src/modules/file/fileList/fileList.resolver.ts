import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";

import { PoliceGuard } from "../../../auth/guard/police.guard";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { FileItemEntity } from "../../../entity/#organization/file/fileItem.entity";
import { FileListService } from "./fileList.service";

@Resolver((of) => [FileBlockEntity])
export class FileListResolver {
  constructor(private fileListService: FileListService) {}

  /********************************************
   * ФАЙЛЫ: ПОЛУЧИТЬ СПИСОК FILE_BLOCK
   ********************************************/
  @UseGuards(PoliceGuard)
  @Query(() => [FileBlockEntity], {
    description: "Файлы: получить список файловых блоков",
  })
  async listFileBlock(
    @Args("ids", {
      type: () => [Int],
      nullable: true,
      description: "id записей",
    })
    ids?: number[],

    @Args("idProject", {
      type: () => Int,
      nullable: true,
      description: "id проекта",
    })
    idProject?: number,

    @Args("idProjectExec", {
      type: () => Int,
      nullable: true,
      description: "id выполнения проекта",
    })
    idProjectExec?: number,

    @Args("idDoc", {
      type: () => Int,
      nullable: true,
      description: "id документа",
    })
    idDoc?: number,

    @Args("idJob", {
      type: () => Int,
      nullable: true,
      description: "id поручения",
    })
    idJob?: number,

    @Args("idIncmail", {
      type: () => Int,
      nullable: true,
      description: "id почтового импорта",
    })
    idIncmail?: number,

    @Args("idReport", {
      type: () => Int,
      nullable: true,
      description: "id отчета",
    })
    idReport?: number,

    @Args("idInventory", {
      type: () => Int,
      nullable: true,
      description: "id описи",
    })
    idInventory?: number,

    @Args("idDocPackage", {
      type: () => Int,
      nullable: true,
      description: "id дела (внутренней описи)",
    })
    idDocPackage?: number,

    @Args("idAct", {
      type: () => Int,
      nullable: true,
      description: "id акта",
    })
    idAct?: number,

    @Args("rkk", {
      type: () => Boolean,
      nullable: true,
      description: "Признак: карточка РКК",
    })
    rkk?: boolean,

    @Args("projectRequired", {
      type: () => Boolean,
      nullable: true,
      description: "Признак: обязательный файл проекта",
    })
    projectRequired?: boolean,
  ): Promise<FileBlockEntity[] | HttpException> {
    const arrFile = await this.fileListService.listFileBlock({
      ids: ids,
      project_id: idProject,
      project_exec_id: idProjectExec,
      doc_id: idDoc,
      job_id: idJob,
      incmail_id: idIncmail,
      report_id: idReport,
      inventory_id: idInventory,
      doc_package_id: idDocPackage,
      act_id: idAct,
      rkk: rkk,
      project_required: projectRequired,
    });
    return arrFile;
  }

  /********************************************
   * ФАЙЛЫ: ПОЛУЧИТЬ СПИСОК FILE_ITEM
   ********************************************/
  @Query(() => [FileItemEntity], {
    description: "Файлы: получить список файлов",
  })
  async listFileItem(
    @Args("ids", {
      type: () => [Int],
      nullable: true,
      description: "id записей",
    })
    ids?: number[],

    @Args("ext", {
      type: () => String,
      nullable: true,
      description: "Расширение файла (без точки)",
    })
    ext?: string,

    @Args("main", {
      type: () => Boolean,
      nullable: true,
      description: "Главный файл",
    })
    main?: boolean,

    @Args("pdfFormat", {
      type: () => String,
      nullable: true,
      description: "Формат PDF",
    })
    pdfFormat?: string,

    @Args("taskPdfFormat", {
      type: () => Boolean,
      nullable: true,
      description: "ЗАДАЧА: Определить формат PDF",
    })
    taskPdfFormat?: boolean,

    @Args("failPdfFormat", {
      type: () => Boolean,
      nullable: true,
      description: "ОШИБКА: Определить формат PDF",
    })
    failPdfFormat?: boolean,

    @Args("fileVersionId", {
      type: () => Int,
      nullable: true,
      description: "Запись в таблице версий: id",
    })
    fileVersionId?: number,
  ): Promise<FileItemEntity[] | HttpException> {
    return this.fileListService.listFileItem({
      ids: ids,
      ext: ext,
      main: main,
      pdf_format: pdfFormat,
      task_pdf_format: taskPdfFormat,
      fail_pdf_format: failPdfFormat,
      file_version_id: fileVersionId,
    });
  }
}
