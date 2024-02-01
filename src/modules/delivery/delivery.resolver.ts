import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { DeliveryEntity } from "../../entity/#organization/delivery/delivery.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { DeliveryService } from "./delivery.service";
import { GetDeliverysArgs } from "./dto/get-delivery.args";
import { InputDto } from "./dto/input.dto";
import { PaginatedDeliveryResponse } from "./dto/paginated-delivery-response.dto";
import { UpdateDto } from "./dto/update";

@UseGuards(DeactivateGuard)
@Resolver(() => DeliveryEntity)
export class DeliveryResolver {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Query(() => PaginatedDeliveryResponse, {
    description: 'Получение справочника "Типы доставки-отправки"',
  })
  deliveries(
    @Args() args: GetDeliverysArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderCatalogInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedDeliveryResponse> {
    return this.deliveryService.findAll(args, pagination, order, searchField);
  }

  @Query(() => DeliveryEntity, {
    nullable: true,
    description: 'Получение запись справочника "Типы доставки-отправки"',
  })
  delivery(@Args("id", { type: () => Int }) id: number): Promise<DeliveryEntity> {
    return this.deliveryService.findOne(id);
  }

  @Query(() => [DeliveryEntity], {
    nullable: true,
    description: 'Получение всех записей справочника "Типы доставки-отправки"',
  })
  async getAllDelivery(): Promise<DeliveryEntity[]> {
    return await this.deliveryService.getAll();
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => DeliveryEntity, {
    nullable: true,
    description: 'Создание записи справочника "Типы доставки-отправки"',
  })
  createDelivery(@Args("input") input: InputDto): Promise<DeliveryEntity> {
    return this.deliveryService.createDelivery(input);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => DeliveryEntity, {
    nullable: true,
    description: 'Удаление записи справочника "Типы доставки-отправки"',
  })
  deleteDelivery(@Args("id", { type: () => Int }) id: number): Promise<DeliveryEntity> {
    return this.deliveryService.deleteDelivery(id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => DeliveryEntity, {
    nullable: true,
    description: 'Обновление записи справочника "Типы доставки-отправки"',
  })
  updateDelivery(@Args("update") update: UpdateDto): Promise<DeliveryEntity> {
    return this.deliveryService.updateDelivery(update);
  }
}
