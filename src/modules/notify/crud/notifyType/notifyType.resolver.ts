import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../../../auth/guard/deactivate.guard";
import { NotifyTypeEntity } from "../../../../entity/#organization/notify/notifyType.entity";
import { PaginationInput, defaultPaginationValues } from "../../../../pagination/paginationDTO";
import {
  NotifyTypeDtoCreate,
  NotifyTypeDtoDel,
  NotifyTypeDtoGet,
  NotifyTypeDtoList,
  NotifyTypeDtoUpdate,
  OrderNotifyTypeInput,
  PaginatedNotifyTypeResponse,
} from "./notifyType.dto";
import { NotifyTypeService } from "./notifyType.service";

const DESC = "Уведомления типы: ";

@Resolver()
@UseGuards(DeactivateGuard)
export class NotifyTypeResolver {
  constructor(private notifyTypeService: NotifyTypeService) {}
  /**
   * LIST
   */
  @Query(() => PaginatedNotifyTypeResponse, {
    description: DESC + "получить список",
  })
  async listNotifyType(
    @Args() args: NotifyTypeDtoList,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка",
    })
    order?: OrderNotifyTypeInput,
  ): Promise<PaginatedNotifyTypeResponse | HttpException> {
    return this.notifyTypeService.listNotifyType(args, pagination, order);
  }

  /**
   * GET
   */
  @Query(() => NotifyTypeEntity, {
    description: DESC + "получить запись",
  })
  async getNotifyType(@Args() args: NotifyTypeDtoGet): Promise<NotifyTypeEntity | HttpException> {
    return this.notifyTypeService.getNotifyType(args);
  }

  // ОТКЛЮЧЕНО Т.К. УСТАНАВЛИВАЕТСЯ СИДАМИ

  // /**
  //  * CREATE
  //  */
  // @UseGuards(PoliceGuard)
  // @Mutation(() => NotifyTypeEntity, {
  //   description: DESC + "создать запись",
  // })
  // async createNotifyType(@Args() args: NotifyTypeDtoCreate): Promise<NotifyTypeEntity | HttpException> {
  //   return this.notifyTypeService.createNotifyType(args);
  // }

  // /**
  //  * UPDATE
  //  */
  // @UseGuards(PoliceGuard)
  // @Mutation(() => NotifyTypeEntity, {
  //   description: DESC + "обновить запись",
  // })
  // async updateNotifyType(@Args() args: NotifyTypeDtoUpdate): Promise<NotifyTypeEntity | HttpException> {
  //   return this.notifyTypeService.updateNotifyType(args);
  // }

  // /**
  //  * DELETE
  //  */
  // @UseGuards(PoliceGuard)
  // @Mutation(() => Boolean, {
  //   description: DESC + "удалить запись",
  // })
  // async deleteNotifyType(@Args() args: NotifyTypeDtoDel): Promise<boolean | HttpException> {
  //   return this.notifyTypeService.deleteNotifyType(args);
  // }
}
