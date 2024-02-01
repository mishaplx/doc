import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { RelCreate } from "./dto/rel.create.dto";
import { RelGet } from "./dto/rel.find.dto";
import { PaginatedRelResponse } from "./dto/rel.paginated.dto";
import { RelUpdate } from "./dto/rel.update.dto";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { RelEntity } from "../../entity/#organization/rel/rel.entity";
import { RelMergeEntity } from "../../entity/#organization/rel/rel.merge.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { RelOrder } from "./dto/rel.order.dto";
import { RelService } from "./rel.service";
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver()
export class RelResolver {
  constructor(private relServ: RelService) {}

  /**
   * Найти записи с пагинацией
   */
  @Query(() => PaginatedRelResponse, {
    description: "Получение списка связок",
  })
  async getRel(
    @Args()
    args: RelGet,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка",
    })
    order: RelOrder,
  ): Promise<PaginatedRelResponse | HttpException> {
    return this.relServ.getRel(args, pagination, order);
  }

  /**
   * Найти запись по id
   */
  @Query(() => RelEntity, {
    description: 'Найти запись "связки" по id',
  })
  async getRelById(
    @Args("id", { type: () => Int })
    id: number,
  ): Promise<RelEntity | HttpException> {
    return this.relServ.getRelById(id);
  }

  /**
   * Создать запись
   */
  @Mutation(() => RelEntity, {
    description: 'Создание записи "связки"',
  })
  async createRel(
    @Args()
    args: RelCreate,
  ): Promise<RelEntity | HttpException> {
    return this.relServ.createRel(args);
  }

  /**
   * Редактировать запись
   */
  @Mutation(() => RelEntity, {
    description: 'Редактирование записи "связки"',
  })
  async updateRel(
    @Args("id", { type: () => Int })
    id: number,
    @Args()
    args: RelUpdate,
  ): Promise<RelEntity | HttpException> {
    return this.relServ.updateRel(id, args);
  }

  /**
   * Пометить запись как удаленную (а не удалить)
   */
  @Mutation(() => RelEntity, {
    description: 'Удаление записи "связки"',
  })
  async deleteRel(
    @Args("id", { type: () => Int })
    id: number,
  ): Promise<RelEntity | HttpException> {
    return this.relServ.deleteRel(id);
  }

  /**
   * Получить связанные документы с заданным
   */
  @Query(() => [RelMergeEntity], {
    description: "Получение списка документов, связанных с заданным",
  })
  async getDocRel(
    @Args("doc_id", {
      type: () => Int,
      description: "id документа, для которого осуществляется поиск",
    })
    doc_id: number,
    @Args("order", {
      nullable: true,
      description: "Сортировка",
    })
    order: RelOrder,
  ): Promise<RelMergeEntity[]> {
    return await this.relServ.getDocRel(doc_id, order);
  }
}
