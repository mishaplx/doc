import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateTemplateContentInput } from "./dto/create-templateContent.input";
import { GetTemplateContentArgs } from "./dto/get-templateContent.args";
import { PaginatedTemplateContentResponse } from "./dto/paginated-templateContent-response.dto";

import { TemplateContentService } from "./templateContent.service";

import { UseGuards } from "@nestjs/common";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { TemplateContentEntity } from "../../entity/#organization/templateContent/template_content.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { OrderTemplateContentInput } from "./dto/order-templateContent-request.dto";
import { UpdateTemplatecontentInput } from "./dto/update-templatecontent.input";
@UseGuards(DeactivateGuard)
@Resolver(() => TemplateContentEntity)
export class TemplateContentResolver {
  constructor(private readonly orgService: TemplateContentService) {}
  @Mutation(() => TemplateContentEntity, {
    description: 'Добавление записи в справочник "Шаблон содержаний"',
  })
  createTemplateContent(
    @Args("createOrgInput") createTempConInput: CreateTemplateContentInput,
  ): Promise<TemplateContentEntity> {
    return this.orgService.create(createTempConInput);
  }

  @Query(() => PaginatedTemplateContentResponse, {
    description: 'Получение справочника "Шаблон содержаний"',
  })
  getAllTemplateContent(
    @Args() args: GetTemplateContentArgs,
    @Args("pagination", {
      description: "Пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderTemplateContentInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedTemplateContentResponse> {
    return this.orgService.findAll(args, pagination, order, searchField);
  }

  @Query(() => TemplateContentEntity, {
    nullable: true,
    description: 'Получение записи справочника "Шаблон содержаний"',
  })
  getTemplateContentById(
    @Args("id", { type: () => Int }) id: number,
  ): Promise<TemplateContentEntity> {
    return this.orgService.findOne(id);
  }

  @Mutation(() => TemplateContentEntity, {
    description: 'Редактирование записи справочника "Шаблон содержаний"',
  })
  updateTemplateContent(
    @Args("updateTmpConInput") updateTempConInput: UpdateTemplatecontentInput,
  ): Promise<TemplateContentEntity> {
    return this.orgService.update(updateTempConInput.id, updateTempConInput);
  }
  @Mutation(() => Boolean, {
    description: 'Удаление записи справочника "Шаблон содержаний"',
  })
  removeTemplateContent(@Args("id", { type: () => Int }) id: number): Promise<boolean> {
    return this.orgService.remove(id);
  }
}
