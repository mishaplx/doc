import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { IncmailEntity } from "../../entity/#organization/inmail/incmail.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { GetIncmailArgs } from "./dto/get-incmails.args";
import { ToDocIncmailInput } from "./dto/import-incmail.input";
import { OrderIncmailsInput } from "./dto/order-incmails-request.dto";
import { PaginatedIncmailResponse } from "./dto/paginated-incmails-response.dto";
import { IncmailService } from "./incmail.service";
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => IncmailEntity)
export class IncmailResolver {
  constructor(private incmailService: IncmailService) {}

  @Query(() => IncmailEntity, { description: "Карточка почтового импорта" })
  getIncmailById(@Args("id", { type: () => Int }) id: number): Promise<IncmailEntity> {
    return this.incmailService.findOne(id);
  }

  @Query(() => PaginatedIncmailResponse, { description: "Почтовый импорт" })
  getAllIncmail(
    @Args() args: GetIncmailArgs,
    @Args("pagination", {
      description: "Пагинация.",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderIncmailsInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedIncmailResponse> {
    return this.incmailService.findAll(args, pagination, order, searchField);
  }

  @Mutation(() => Boolean, {
    description: "Импортировать письма с почтовых серверов",
  })
  updmail(@Token() token: IToken): boolean {
    return this.incmailService.importIncmail(token.url);
  }

  @Mutation(() => Boolean, { description: "Переместить письмо в документы" })
  importIncmail(
    @Args("toDocIncmailInput") toDocIncmailInput: ToDocIncmailInput,
  ): Promise<boolean | HttpException> {
    return this.incmailService.toDocIncmail(toDocIncmailInput);
  }

  @Mutation(() => Boolean, {
    description: "Удалить письма из почтового импорта",
  })
  async incmailDelete(
    @Args("incmail_ids", {
      type: () => [Int],
      description: "Почтовый импорт: ids",
    })
    incmail_ids: number[],
  ): Promise<boolean | HttpException> {
    return await this.incmailService.incmailDelete({
      incmail_ids: incmail_ids,
      delete_file: true,
    });
  }
}
