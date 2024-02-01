import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { FileBlockEntity } from "../../../entity/#organization/file/fileBlock.entity";
import { FileVersionEntity } from "../../../entity/#organization/file/fileVersion.entity";
import { FileUpdateService } from "./fileUpdate.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class FileUpdateResolver {
  constructor(private fileUpdateService: FileUpdateService) {}

  /********************************************
   * БЛОК ФАЙЛА: УБРАТЬ ПРИЗНАК ОБЯЗАТЕЛЬНОГО ФАЙЛА (ТОЛЬКО ДЛЯ ПРОЕКТОВ)
   ********************************************/
  @Mutation(() => FileBlockEntity, {
    description: "Блок файла: убрать признак обязательного файла (только для проектов)",
  })
  async updateFileBlockProjectRequired(
    @Args("idFileBlock", {
      type: () => Int,
      description: "Блок файла: id записи",
    })
    idFileBlock: number,
  ): Promise<FileBlockEntity | HttpException> {
    return this.fileUpdateService.updateFileBlockProjectRequired({
      idFileBlock: idFileBlock,
    });
  }

  /********************************************
   * ВЕРСИЯ ФАЙЛА: ОБНОВИТЬ ЗАПИСЬ
   ********************************************/
  @Mutation(() => FileVersionEntity, {
    description: "Версия файла: обновить запись",
  })
  async updateFileVersion(
    @Args("idFileVersion", {
      type: () => Int,
      description: "Версия файла: id записи",
    })
    idFileVersion: number,

    @Args("name", {
      type: () => String,
      nullable: true,
      description: "Новое название файла",
    })
    name: string,

    @Args("note", {
      type: () => String,
      nullable: true,
      description: "Примечание",
    })
    note: string,

    @Args("taskPdfCreate", {
      type: () => Boolean,
      nullable: true,
      description: "ЗАДАЧА: Создать PDF-копию",
    })
    taskPdfCreate: boolean,

    @Args("failPdfCreate", {
      type: () => Boolean,
      nullable: true,
      description: "ОШИБКА: Создать PDF-копию",
    })
    failPdfCreate: boolean,

    @Args("taskMainContent", {
      type: () => Boolean,
      nullable: true,
      description: "ЗАДАЧА: Получить текстовое содержание главного файла",
    })
    taskMainContent: boolean,

    @Args("failMainContent", {
      type: () => Boolean,
      nullable: true,
      description: "ОШИБКА: Получить текстовое содержание главного файла",
    })
    failMainContent: boolean,
  ): Promise<FileVersionEntity | HttpException> {
    return this.fileUpdateService.updateFileVersion({
      idFileVersion: idFileVersion,
      name: name,
      note: note,
      task_pdf_create: taskPdfCreate,
      fail_pdf_create: failPdfCreate,
      task_main_content: taskMainContent,
      fail_main_content: failMainContent,
    });
  }
}
