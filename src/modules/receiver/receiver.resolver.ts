import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { ReceiverEntity } from "../../entity/#organization/receiver/receiver.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { CreateReceiverInput } from "./dto/create-receiver.input";
import { GetReceiverArgs } from "./dto/get-receiver.args";
import { OrderReceiverRequestDto } from "./dto/order-receiver-request.dto";
import { PaginatedReceiverResponse } from "./dto/paginated-receiver-response.dto";
import { UpdateReceiverInput } from "./dto/update-receiver.input";
import { ReceiverService } from "./receiver.service";
@UseGuards(DeactivateGuard)
@Resolver(() => ReceiverEntity)
export class ReceiverResolver {
  constructor(private readonly orgService: ReceiverService) {}
  @Mutation(() => ReceiverEntity, {
    description: 'Добавление записи в справочник "Адресат"',
  })
  createReceiver(
    @Args("createReceiverInput") createReceiverConInput: CreateReceiverInput,
  ): Promise<ReceiverEntity> {
    return this.orgService.create(createReceiverConInput);
  }

  @Query(() => PaginatedReceiverResponse, {
    description: 'Получение справочника "Адресат"',
  })
  getAllReceiver(
    @Args() args: GetReceiverArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderReceiverRequestDto,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedReceiverResponse> {
    return this.orgService.findAll(args, pagination, order, searchField);
  }

  @Query(() => ReceiverEntity, {
    nullable: true,
    description: 'Получение записи справочника "Адресат"',
  })
  getReceiverById(@Args("id", { type: () => Int }) id: number): Promise<ReceiverEntity> {
    return this.orgService.findOne(id);
  }

  @Mutation(() => ReceiverEntity, {
    description: 'Редактирование записи справочника "Адресат"',
  })
  updateReceiver(
    @Args("updateReceiverInput") updateTempConInput: UpdateReceiverInput,
  ): Promise<ReceiverEntity> {
    return this.orgService.update(updateTempConInput.id, updateTempConInput);
  }

  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Адресат"',
  })
  removeReceiver(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.orgService.remove(id);
  }
}
