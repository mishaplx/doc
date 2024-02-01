import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { OrderCatalogInput } from "../../common/argsType/order-catalog-request.dto";
import { TermEntity } from "../../entity/#organization/term/term.entity";
import { PaginationInput, defaultPaginationValues } from "../../pagination/paginationDTO";
import { CreateTermInput } from "./dto/create-term.input";
import { GetTermArgs } from "./dto/get-terms.args";
import { PaginatedTermResponse } from "./dto/paginated-term-response.dto";
import { UpdateTermInput } from "./dto/update-term.input";
import { TermService } from "./term.service";

@UseGuards(DeactivateGuard)
@Resolver(() => TermEntity)
export class TermResolver {
  constructor(private termService: TermService) {}

  @Mutation(() => TermEntity, {
    description: 'Добавление записи в справочник "Сроки хранения"',
  })
  createTerm(@Args("createTermInput") createTermInput: CreateTermInput): Promise<TermEntity> {
    return this.termService.create(createTermInput);
  }

  @Query(() => PaginatedTermResponse, {
    description: 'Получение справочника "Сроки хранения"',
  })
  getAllTerm(
    @Args() args: GetTermArgs,
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
  ): Promise<PaginatedTermResponse> {
    return this.termService.findAll(args, pagination, order, searchField);
  }

  @Query(() => TermEntity, {
    nullable: true,
    description: 'Получение записи справочника "Сроки хранения"',
  })
  term(@Args("id", { type: () => Int }) id: number): Promise<TermEntity> {
    return this.termService.findOne(id);
  }

  @Mutation(() => TermEntity, {
    description: 'Редактирование записи справочника "Сроки хранения"',
  })
  updateTerm(@Args("updateTermInput") updateTermInput: UpdateTermInput): Promise<TermEntity> {
    return this.termService.update(updateTermInput.id, updateTermInput);
  }

  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Сроки хранения"',
  })
  removeTerm(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.termService.remove(id);
  }
}
