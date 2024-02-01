import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { TdocEntity } from "../../entity/#organization/doc/tdoc.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { GetTypeDocArgs } from "./dto/get-typeDoc.args";
import { OrderTdocInput } from "./dto/order-tdoc-request.dto";
import { PaginatedTypedocResponseDto } from "./dto/paginated-typedoc-response.dto";
import { TypesDocUpdate } from "./dto/typesdocDTO.type";
import { UnputViewDto } from "./dto/unputView.dto";
import { TypesDocService } from "./typesdoc.service";

@Resolver(() => TdocEntity)
export class TypesDocResolver {
  constructor(private typesDocServ: TypesDocService) {}

  /**
   * Получение списка типов документов
   */

  @Query(() => PaginatedTypedocResponseDto, {
    description: "Получение списка Видов документов",
  })
  getAllViewDoc(
    @Args() args: GetTypeDocArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderTdocInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedTypedocResponseDto> {
    return this.typesDocServ.getAllTypes(args, pagination, order, searchField);
  }

  /**
   * Получение списка видов документа
   */
  @Query(() => [TdocEntity], {
    description: "Получение списка видов документа без пагинации",
  })
  async getAllViewDocument(): Promise<TdocEntity[]> {
    return this.typesDocServ.getAllDocView();
  }

  @Query(() => TdocEntity, {
    description: "Получение списка Видов документов",
  })
  getViewDocByid(@Args("id") id: number): Promise<TdocEntity> {
    return this.typesDocServ.getViewDocByid(id);
  }

  /**
   * Создание нового типа документов
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => TdocEntity, {
    description: "Создание нового Вида документов",
  })
  createViewDoc(@Args("viewdocInput") viewdocInput: UnputViewDto): Promise<TdocEntity> {
    return this.typesDocServ.createTypeDoc(viewdocInput);
  }

  @Mutation(() => TdocEntity, {
    description: "Обновления Вида документов",
  })
  @UseGuards(DeactivateGuard, PoliceGuard)
  updateViewDoc(
    @Args("input", {
      description: "Новые данные ",
    })
    input: TypesDocUpdate,
  ): Promise<TdocEntity> {
    return this.typesDocServ.updateTypeDoc(input);
  }

  /**
   * Удаление типа документов
   * @param id id записи типа документов
   */
  @UseGuards(DeactivateGuard, PoliceGuard)
  @Mutation(() => Boolean, {
    description: "Удалить Вид документов",
    nullable: true,
  })
  deleteViewDoc(
    @Args("id", {
      description: "id Вид документов",
    })
    id: number,
  ): Promise<boolean> {
    return this.typesDocServ.deleteTypeDoc(id);
  }
}
