import { HttpException, Req, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "src/auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { FileDeleteService } from "./fileDelete.service";

@UseGuards(DeactivateGuard)
@Resolver()
export class FileDeleteResolver {
  constructor(private fileDeleteService: FileDeleteService) {}

  /********************************************
   * ФАЙЛЫ: УДАЛИТЬ ФАЙЛОВЫЙ БЛОК
   ********************************************/
  @Mutation(() => Boolean, { description: "Файлы: удалить файловый блок" })
  async deleteFileBlock(
    @Args("idFileBlock", {
      type: () => Int,
      description: "Файловый блок: id",
    })
    idFileBlock: number,
    @Token() token: IToken,
    @Req() req,
  ): Promise<boolean | HttpException> {
    return this.fileDeleteService.deleteFileBlock({
      token,
      idFileBlock,
      req,
    });
  }

  /********************************************
   * ФАЙЛЫ: УДАЛИТЬ ВЕРСИЮ ФАЙЛА
   * ЕСЛИ ВЕРСИЯ ЕДИНСТВЕННАЯ - УДАЛИТЬ БЛОК ЦЕЛИКОМ
   ********************************************/
  @Mutation(() => Boolean, { description: "Файлы: удалить версию файла" })
  async deleteFileVersion(
    @Token() token: IToken,
    @Req() req,
    @Args("idFileVersion", {
      type: () => Int,
      description: "id записи версии файла",
    })
    idFileVersion: number,
  ): Promise<boolean | HttpException> {
    return this.fileDeleteService.deleteFileVersion(idFileVersion, token, req);
  }

  /********************************************
   * ФАЙЛЫ: УДАЛИТЬ ЗАВИСИМЫЙ ФАЙЛ
   ********************************************/
  @Mutation(() => Boolean, { description: "Файлы: удалить зависимый файл" })
  async deleteFileVersionDepend(
    @Args("idFileVersion", {
      type: () => Int,
      description: "id записи версии файла",
    })
    idFileVersion: number,
  ): Promise<boolean | HttpException> {
    return this.fileDeleteService.deleteFileVersionDepend(idFileVersion);
  }
}
