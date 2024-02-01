import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { ProjectTemplateEntity } from "../../entity/#organization/project_template/project_template.entity";
import { PaginationInput } from "../../pagination/paginationDTO";
import { GetProjectTemplateArgs } from "./dto/get-project-template.args";
import { OrderProjectTemplateXInput } from "./dto/order-project-template-request.dto";
import { PaginatedProjectTemplateResponse } from "./dto/paginated-project-template-response.dto";
import { ProjectTemplateService } from "./projectTemplate.service";
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver(() => ProjectTemplateEntity)
export class ProjectTemplateResolver {
  constructor(private projectTemplateService: ProjectTemplateService) {}

  /**
   * LIST
   */
  @Query(() => PaginatedProjectTemplateResponse, {
    description: "Шаблоны проектов",
  })
  async projectTemplatesGet(
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderProjectTemplateXInput,
    @Args() args?: GetProjectTemplateArgs,
    @Args("pagination", { nullable: true, description: "Пагинация" })
    pagination?: PaginationInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedProjectTemplateResponse | HttpException> {
    return this.projectTemplateService.getProjectTemplates(pagination, order, args, searchField);
  }

  /**
   * Добавить шаблон проекта
   */
  @Query(() => ProjectTemplateEntity, {
    description: "Добавить шаблон проекта",
  })
  async projectTemplateAdd(
    @Args("nm", { nullable: true }) nm: string,
    @Args("fileItemId", { nullable: true }) fileItemId: number,
    @Args("tdoc", { nullable: true }) tdoc: number,
  ): Promise<ProjectTemplateEntity | HttpException> {
    return this.projectTemplateService.addProjectTemplate(nm, fileItemId, tdoc);
  }

  /**
   * Изменить шаблон проекта
   */
  @Query(() => ProjectTemplateEntity, {
    description: "Изменить шаблон проекта",
  })
  async projectTemplateEdit(
    @Args("id", { nullable: true }) id: number,
    @Args("nm", { nullable: true }) nm: string,
    @Args("tdoc", { nullable: true }) tdoc: number,
  ): Promise<ProjectTemplateEntity | HttpException> {
    return this.projectTemplateService.changeProjectTemplate(id, nm, tdoc);
  }

  /**
   * Удалить шаблон проекта
   */
  @Query(() => Boolean, {
    description: "Удалить шаблон проекта",
  })
  async projectTemplateDelete(
    @Args("id", { nullable: true }) id: number,
  ): Promise<boolean | HttpException> {
    return this.projectTemplateService.deleteProjectTemplate(id);
  }
}
