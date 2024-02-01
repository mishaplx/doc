import { HttpException } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { indifferentActivity } from "src/auth/decorator/indifferentActivity.decorator";
import { Token } from "../../../../auth/decorator/token.decorator";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { NotifyEntity } from "../../../../entity/#organization/notify/notify.entity";
import { PaginationInput, defaultPaginationValues } from "../../../../pagination/paginationDTO";
import {
  NotifyDtoCreate,
  NotifyDtoDel,
  NotifyDtoGet,
  NotifyDtoInfo,
  NotifyDtoList,
  NotifyDtoUpdate,
  OrderNotifyInput,
  PaginatedNotifyResponse,
} from "./notify.dto";
import { NotifyService } from "./notify.service";

const DESC = "Уведомления: ";

@Resolver()
export class NotifyResolver {
  constructor(private notifyService: NotifyService) {}

  /**
   * INFO
   */
  @indifferentActivity()
  @Query(() => NotifyDtoInfo, {
    description: DESC + "получить последние и количество непрочитанных",
  })
  async infoNotify(@Token() token: IToken): Promise<NotifyDtoInfo | HttpException> {
    return this.notifyService.infoNotify(token.current_emp_id);
  }

  /**
   * LIST
   */
  @Query(() => PaginatedNotifyResponse, {
    description: DESC + "получить список",
  })
  async listNotify(
    @Token() token: IToken,
    @Args() args: NotifyDtoList,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка",
    })
    order?: OrderNotifyInput,
  ): Promise<PaginatedNotifyResponse | HttpException> {
    args.emp_id = token.current_emp_id;
    return this.notifyService.listNotify(args, pagination, order);
  }

  /**
   * GET
   */
  @Query(() => NotifyEntity, {
    description: DESC + "получить запись",
  })
  async getNotify(
    @Token() token: IToken,
    @Args() args: NotifyDtoGet,
  ): Promise<NotifyEntity | HttpException> {
    return this.notifyService.getNotify(args, token.current_emp_id);
  }

  /**
   * CREATE
   */
  @Mutation(() => NotifyEntity, {
    description: DESC + "создать запись",
  })
  async createNotify(
    @Token() token: IToken,
    @Args() args: NotifyDtoCreate,
  ): Promise<NotifyEntity | HttpException> {
    args.emp_id = token.current_emp_id;
    return this.notifyService.createNotify(args);
  }

  /**
   * UPDATE
   */
  @Mutation(() => Boolean, {
    description: DESC + "обновить записи",
  })
  async updateNotify(
    @Token() token: IToken,
    @Args() args: NotifyDtoUpdate,
  ): Promise<boolean | HttpException> {
    return this.notifyService.updateNotify(args, token.current_emp_id);
  }

  /**
   * DELETE
   */
  @Mutation(() => Boolean, {
    description: DESC + "удалить записи",
  })
  async deleteNotify(
    @Token() token: IToken,
    @Args() args: NotifyDtoDel,
  ): Promise<boolean | HttpException> {
    return this.notifyService.deleteNotify(args, token.current_emp_id);
  }
}
