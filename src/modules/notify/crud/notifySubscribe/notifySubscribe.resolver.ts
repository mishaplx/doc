import { HttpException } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../../../auth/decorator/token.decorator";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NotifySubscribeService } from "./notifySubscribe.service";

const DESC = "Уведомления подписки: ";

@Resolver()
export class NotifySubscribeResolver {
  constructor(private notifySubscribeService: NotifySubscribeService) {}

  /**
   * GET
   */
  @Query(() => [Int], {
    description: DESC + "прочитать",
  })
  async getNotifySubscribe(
    @Token()
    token: IToken,
  ): Promise<number[] | HttpException> {
    return this.notifySubscribeService.getNotifySubscribe(token.current_emp_id);
  }

  /**
   * SET
   */
  @Mutation(() => Boolean, {
    description: DESC + "записать",
  })
  async setNotifySubscribe(
    @Token()
    token: IToken,

    @Args("notify_type_ids", {
      type: () => [Int],
      description: "Список типов уведомлений: ids",
    })
    notify_type_ids: number[],
  ): Promise<boolean | HttpException> {
    return this.notifySubscribeService.setNotifySubscribe(token.current_emp_id, notify_type_ids);
  }
}
