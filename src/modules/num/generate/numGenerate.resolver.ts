import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NumGenerateService } from "./numGenerate.service";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumGenerateResolver {
  constructor(private numGenerateService: NumGenerateService) {}

  /**
   * ГЕНЕРАТОР: ПОЛУЧИТЬ НОМЕР
   */
  @Mutation(() => String, { description: "Зарезервировать номер" })
  async runNumGenerate(
    @Token()
    token: IToken,

    @Args("doc_id", {
      type: () => Int,
      description: "Регистрируемый документ: id",
    })
    doc_id: number,

    @Args("reserved_counter", {
      type: () => Int,
      nullable: true,
      description: "Ранее зарезервированный номер счетчика",
    })
    reserved_counter?: number,

    @Args("prepare", {
      type: () => Boolean,
      defaultValue: false,
      nullable: true,
      description: "Получить, но не регистрировать номер (предварительный номер)",
    })
    prepare?: boolean,
  ): Promise<string | HttpException> {
    return (await this.numGenerateService.runNumGenerate({
      emp_id: token.current_emp_id,
      doc_id: doc_id,
      reserved_counter: reserved_counter,
      prepare: prepare,
    })) as string;
  }
}
