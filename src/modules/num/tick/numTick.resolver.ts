import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";

import { Token } from "../../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NumTickService } from "./numTick.service";

@Resolver()
@UseGuards(DeactivateGuard)
export class NumTickResolver {
  constructor(private numTickService: NumTickService) {}

  /**
   * СЧЕТЧИК: ЗАРЕЗЕРВИРОВАТЬ НОМЕР
   */
  @Mutation(() => Int, { description: "Зарезервировать номер" })
  async reserveNumTick(
    @Token()
    token: IToken,

    @Args("num_id", {
      type: () => Int,
      description: "Нумератор: id",
    })
    num_id: number,

    @Args("note", {
      type: () => String,
      nullable: true,
      description: "Пояснение",
    })
    note?: string,

    @Args("privat", {
      type: () => Boolean,
      defaultValue: true,
      nullable: true,
      description: "Зарезервировать для текущего пользователя",
    })
    privat?: boolean,
  ): Promise<number | HttpException> {
    return this.numTickService.reserveNumTick({
      num_id: num_id,
      privat: privat,
      note: note,
      emp_id: token.current_emp_id,
    });
  }

  /**
   * СЧЕТЧИК: СНЯТЬ РЕЗЕРВ НОМЕРА
   */
  @Mutation(() => Int, { description: "Снять резерв номера" })
  async unreserveNumTick(
    @Token()
    token: IToken,

    @Args("num_id", {
      type: () => Int,
      description: "Нумератор: id",
    })
    num_id: number,

    @Args("val", {
      type: () => Int,
      description: "Ранее зарезервированное значение счетчика",
    })
    val: number,
  ): Promise<number | HttpException> {
    return this.numTickService.unreserveNumTick({
      num_id: num_id,
      val: val,
      emp_id: token.current_emp_id,
    });
  }

  /**
   * СЧЕТЧИК: ВЗЯТЬ НОМЕР
   */
  @Mutation(() => Int, { description: "Получить номер" })
  async takeNumTick(
    @Token()
    token: IToken,

    @Args("num_id", {
      type: () => Int,
      description: "Нумератор: id",
    })
    num_id: number,

    @Args("val", {
      type: () => Int,
      nullable: true,
      description: "Запрашиваемое значение счетчика (если ранее было зарезервировано)",
    })
    val?: number,

    @Args("only_queue", {
      type: () => Boolean,
      defaultValue: false,
      nullable: true,
      description: "Исключить получение резервируемого номера (только очередной)",
    })
    only_queue?: boolean,

    @Args("prepare", {
      type: () => Boolean,
      defaultValue: false,
      nullable: true,
      description: "получить, но не регистрировать номер (предварительный номер)",
    })
    prepare?: boolean,
  ): Promise<number | HttpException> {
    return this.numTickService.takeNumTick({
      num_id: num_id,
      val: val,
      only_queue: only_queue,
      prepare: prepare,
      emp_id: token.current_emp_id,
    });
  }
}
