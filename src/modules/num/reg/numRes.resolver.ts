import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NumRegService } from "./numReg.service";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumRegResolver {
  constructor(private numRegService: NumRegService) {}

  /**
   * ГЕНЕРАТОР: ПОЛУЧИТЬ НОМЕР
   */
  @Mutation(() => String, { description: "Зарегистрировать документ" })
  async regDoc(
    @Token()
    token: IToken,

    @Args("doc_id", {
      type: () => Int,
      description: "Регистрируемый документ: id",
    })
    doc_id: number,

    @Args("ignore_unique", {
      type: () => Boolean,
      nullable: true,
      description: "Игнорировать уникальность комбинации (дата регистрации, номер и тип документа)",
    })
    ignore_unique: boolean,

    @Args("reserved_counter", {
      type: () => Int,
      nullable: true,
      description: "Ранее зарезервированный номер счетчика",
    })
    reserved_counter?: number,
  ): Promise<string | HttpException> {
    return (await this.numRegService.regDoc({
      emp_id: token.current_emp_id,
      doc_id: doc_id,
      ignore_unique: ignore_unique,
      reserved_counter: reserved_counter,
    })) as string;
  }
}
