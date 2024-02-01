import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "src/auth/decorator/token.decorator";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { FileBlockEntity } from "../../entity/#organization/file/fileBlock.entity";
import { FileService } from "./file.service";

@UseGuards(DeactivateGuard)
@Resolver(() => FileBlockEntity)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  /********************************************
   * РАЗБЛОКИРОВАТЬ ДОСТУП К ФАЙЛОВОМУ БЛОКУ
   ********************************************/
  @Mutation(() => Boolean, {
    description: "Разблокировать доступ к файловому блоку",
  })
  async unblockedFileBlock(
    @Args("idFileBlock", {
      type: () => Int,
      description: "Блок файла: id записи",
    })
    idFileBlock: number,
    @Token() token: IToken,
  ): Promise<boolean> {
    return this.fileService.unblockedFileBlock({
      token: token,
      file_block_id: idFileBlock,
    });
  }

  /********************************************
   * ОТПРАВИТЬ ФАЙЛ НА ПОВТОРНУЮ КОНВЕРТАЦИЮ
   ********************************************/
  @Mutation(() => Boolean, {
    description: "Отправить файл на повторную конвертацию",
  })
  async repeatConvertation(
    @Args("fileVersionId", {
      type: () => Int,
      description: "Версия файла: id записи",
    })
    fileVersionId: number,
  ): Promise<boolean> {
    return this.fileService.repeatConvertation(fileVersionId);
  }
}
