import { HttpException, Injectable, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { ActionsProject } from "../../BACK_SYNC_FRONT/actions/actions.project";
import { ProjectEntity } from "../../entity/#organization/project/project.entity";
import { defaultPaginationValues, PaginationInput } from "../../pagination/paginationDTO";
import { Access } from "../access/guard/access.guard";
import { GetcurrentRouteDto } from "./dto/currentroute/getcurrentRoute.dto";
import { GetProjectsArgs } from "./dto/get-projects.args";
import { OrderProjectsInput } from "./dto/order-projects-request.dto";
import { PaginatedProjectsResponse } from "./dto/paginated-projects-response.dto";
import { ProjectUpdate } from "./dto/projects.dto";
import { ResponseProjectID } from "./dto/responseProjectID";
import { ProjectsService } from "./projects.service";

@Injectable()
@UseGuards(DeactivateGuard, PoliceGuard)
@Resolver("project")
export class ProjectsResolver {
  constructor(private projectsService: ProjectsService) {}

  /**
   * Получение списка проектов
   * @param token
   * @param args
   * @param pagination пагинация
   * @param order
   * @param searchField
   */

  @Query(() => PaginatedProjectsResponse)
  getAllProjects(
    @Token() token: IToken,
    @Args() args: GetProjectsArgs,
    @Args("pagination", {
      description: "пагинация",
      defaultValue: defaultPaginationValues,
    })
    pagination: PaginationInput,
    @Args("order", {
      nullable: true,
      description: "Сортировка.",
    })
    order?: OrderProjectsInput,
    @Args("searchField", {
      nullable: true,
      description: "Поиск по всему гриду",
    })
    searchField?: string,
  ): Promise<PaginatedProjectsResponse> {
    return this.projectsService.getAllProjects(
      args,
      pagination,
      order,
      token.current_emp_id,
      searchField,
    );
  }

  /**
   * Получение проекта по id
   * @param id
   */

  /**
   * ПРОЕКТ: ПРОЧИТАТЬ
   */
  @Query(() => ResponseProjectID)
  async getProjectsById(
    @Token() token: IToken,
    @Args("id") id: number,
  ): Promise<HttpException | ResponseProjectID> {
    return await this.projectsService.getProjectsById(token, id);
  }

  /**
   * Создание пустого проекта
   */

  @Mutation(() => ProjectEntity, {
    description: "Создание пустого проекта",
  })
  async createProject(@Token() token: IToken): Promise<ProjectEntity> {
    return await this.projectsService.createProject(token.current_emp_id);
  }

  @Mutation(() => ProjectEntity, {
    description: "Редактирование проекта",
  })
  updateProject(
    @Args("flagButton", {
      description:
        "1 - сохранить 2 - отправить по маршруту, 3 - удалить маршрут и сохранить проект",
      type: () => Int,
    })
    flagButton: number,
    @Args("projectItem", {
      description: "Новые данные проекта",
    })
    projectItem: ProjectUpdate,
  ): Promise<ProjectEntity | HttpException> {
    return this.projectsService.updateProject(projectItem, flagButton);
  }

  @Mutation(() => Boolean, {
    description: "Закрыть проект",
  })
  closeProject(
    @Args("projectId", {
      description: "id проекта",
      type: () => Int,
    })
    projectId: number,
    @Args("remark", {
      description: "комментарий",
      type: () => String,
      defaultValue: "",
      nullable: true,
    })
    remark: string,
    @Token() token: IToken,
  ): Promise<boolean | HttpException> {
    return this.projectsService.closeProject(projectId, remark, token);
  }

  /**
   * Получение списка маршрутов в зависимости от типа и вида документа
   * @param id_type_doc
   * @param id_view_doc
   */
  @Query(() => [GetcurrentRouteDto], {
    description: "Получение списка маршрутов в зависимости от типа и вида документа",
  })
  getCorrectRoute(
    @Args("id_type_doc") id_type_doc: number,
    @Args("id_view_doc") id_view_doc: number,
  ): Promise<HttpException | GetcurrentRouteDto[]> {
    return this.projectsService.getCorrectRoute(id_type_doc, id_view_doc);
  }

  @Mutation(() => Boolean)
  sendToRoute(
    @Args("id_project") id_project: number,
    @Args("isSign", { defaultValue: false }) isSign: boolean,
    @Token() token: IToken,
  ): Promise<boolean | HttpException> {
    return this.projectsService.sendToRoute(id_project, isSign, token);
  }

  @Access(ActionsProject.PROJECT_STAGE_CONFIRM)
  @Mutation(() => Boolean, {
    description: "Визировать, Утвердить, Подписать --- кнопка Визировать",
  })
  stageWithConfirm(
    @Args("id_project", {
      nullable: false,
    })
    id_project: number,
    @Args("id_stage", {
      nullable: false,
    })
    id_stage: number,

    @Token() token: IToken,
    @Args("note", {
      nullable: true,
    })
    note?: string,
    @Args("sign", {
      nullable: true,
    })
    sign?: string,
  ) {
    return this.projectsService.stageWithConfirm(id_project, id_stage, token, note, sign);
  }

  @Mutation(() => Boolean, {
    description: "Удалить проекта",
  })
  deleteProject(
    @Args("id_project", {
      nullable: false,
    })
    id_project: number,
  ): Promise<HttpException | boolean> {
    return this.projectsService.deleteProject(id_project);
  }
}
