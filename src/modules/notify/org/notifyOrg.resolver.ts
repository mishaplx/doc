import { HttpException } from "@nestjs/common";
import { Mutation, Resolver } from "@nestjs/graphql";

import { Token } from "../../../auth/decorator/token.decorator";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NotifyEntity } from "../../../entity/#organization/notify/notify.entity";
import { NotifyOrgService } from "./notifyOrg.service";

const DESC = "Уведомления: ";

@Resolver()
// @UseGuards(DeactivateGuard)
export class NotifyOrgResolver {
  constructor(private notifyOrgService: NotifyOrgService) {}

  /**
   * ПОМЕТИТЬ ВСЕ СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЯ КАК ПРОЧИТАННЫЕ
   */
  @Mutation(() => Boolean, {
    description: DESC + "пометить все как прочитанные",
  })
  async readAllNotify(@Token() token: IToken): Promise<boolean> {
    return await this.notifyOrgService.readAllNotify(token);
  }

  /**
   * ADD
   * ДЛЯ ТЕСТА
   */
  @Mutation(() => NotifyEntity, {
    description: DESC + "добавить (ДЛЯ ТЕСТА)",
  })
  async addNotify(): Promise<NotifyEntity | void | HttpException> {
    return this.notifyOrgService.addNotify({
      notify_type_id: 1,
      emp_ids: [1],
      doc_id: 2,
      message: "TEST",
    });
  }
}
