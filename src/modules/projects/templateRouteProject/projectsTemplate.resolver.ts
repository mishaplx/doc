import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PaginationInput, defaultPaginationValues } from "../../../pagination/paginationDTO";
import { ProjectsTemplateService } from "./projectsTemplate.service";

import { HttpException, UseGuards } from "@nestjs/common";
import { DeactivateGuard } from "../../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../../auth/guard/police.guard";
import { ProjectActionEntity } from "../../../entity/#organization/project/ProjectAction.entity";
import { ProjectSubActionEntity } from "../../../entity/#organization/project/projectSubAction.entity";
import { TemplateRouteProjectEntity } from "../../../entity/#organization/templateRouteProject/template_route_project.entity";
import { AddTemplateRouteDtoDto } from "../dto/addTemplateRouteDto/addTemplateRouteDto.dto";
import { PaginatedTempRouteProjectResponse } from "../dto/pagination-template-route-project-response.dto";
import { TemplateRouteProjectType } from "../type/TemplateRouteProjectType";
import { TemplateRouteUpdate } from "../type/TemplateRouteUpdate";
import { GetProjectsTemplateArgs } from "./dto/get-projects-template.args";
import { OrderProjectTemplateInput } from "./dto/order-projects-template-request.dto";
@UseGuards(DeactivateGuard)
@Resolver()
export class ProjectsTemplateResolver {
  constructor(private projectsTemplateService: ProjectsTemplateService) {}

  /**
   * Получение списка проектов
   * @param args
   * @param pagination пагинация
   * @param order
   */
  @Query(() => PaginatedTempRouteProjectResponse)
  getAllProjectsTemplateRoute(
    @Args() args: GetProjectsTemplateArgs,
    @Args("pagination", {
      description: "пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderProjectTemplateInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedTempRouteProjectResponse> {
    return this.projectsTemplateService.getAllProjectsTemplateRoute(
      args,
      pagination,
      order,
      searchField,
    );
  }
  @Query(() => TemplateRouteProjectType, {
    description: "Получить шаблона маршрута проекта по id",
  })
  getProjectsTemplateRouteById(
    @Args("id", { description: "id шаблона маршрута проекта" }) id: number,
  ): Promise<TemplateRouteProjectType> {
    return this.projectsTemplateService.getProjectsTemplateRouteById(id);
  }

  /**
   * Создание маршрута проекта
   */
  // @Mutation(() => ProjectEntity, {
  //   description: 'Создание пустого проекта',
  // })
  // createRouteProject(): Promise<ProjectEntity> {
  //   return this.projectsTemplateService.createRouteProject();
  // }
  @UseGuards(PoliceGuard)
  @Query(() => [ProjectActionEntity], {
    description: "получение всех действий ",
  })
  async getAllAction() {
    return await this.projectsTemplateService.getAllAction();
  }
  @Query(() => [ProjectSubActionEntity], {
    description: "получение всех под-действий ",
  })
  async getAllSubAction() {
    return await this.projectsTemplateService.getAllSubAction();
  }

  // /**
  //  * Добавление добавление шаблона маршрута для проекта документа
  //  */
  @Mutation(() => TemplateRouteProjectEntity, {
    description: "Добавление проекта",
  })
  addTemplateRouteProject(
    @Args("addTemplateRouteDto") AddTemplateRouteDtoDto: AddTemplateRouteDtoDto,
  ): Promise<TemplateRouteProjectEntity> {
    return this.projectsTemplateService.addTemplateRouteProject(AddTemplateRouteDtoDto);
  }
  @Mutation(() => Boolean, {
    description: "Удаление шаблона маршрута проекта",
  })
  async deleteTemplateRouteProject(
    @Args("id", { description: "id шаблона маршрута проекта" }) id: number,
  ): Promise<HttpException | boolean> {
    return await this.projectsTemplateService.deleteTemplateRouteProject(id);
  }

  /**
   * Редактирование проекта
   * @param projectId id проекта
   * @param ProjectUpdate
   */
  @Mutation(() => Boolean, {
    description: "Редактирование проекта",
  })
  updateTemplateRouteProject(
    @Args("ProjectUpdate", {
      description: "Новые данные проекта",
    })
    ProjectUpdate: TemplateRouteUpdate,
  ): Promise<boolean> {
    return this.projectsTemplateService.updateProjectTemplate(ProjectUpdate);
  }
}
