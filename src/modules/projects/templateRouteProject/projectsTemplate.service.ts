import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { PREF_ERR } from "../../../common/enum/enum";
import {
  globalSearchDocBuilderDoc,
  searchAllColumnWithoutRelation,
} from "../../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { ProjectActionEntity } from "../../../entity/#organization/project/ProjectAction.entity";
import { ProjectSubActionEntity } from "../../../entity/#organization/project/projectSubAction.entity";
import { TemplateRouteProjectEntity } from "../../../entity/#organization/templateRouteProject/template_route_project.entity";
import {
  getPaginatedData,
  listPaginationData,
  paginatedResponseResult,
} from "../../../pagination/pagination.service";
import { PaginationInput } from "../../../pagination/paginationDTO";
import { wLogger } from "../../logger/logging.module";
import { PaginatedTempRouteProjectResponse } from "../dto/pagination-template-route-project-response.dto";
import { ProjectsService } from "../projects.service";
import { TemplateRouteProjectType } from "../type/TemplateRouteProjectType";
import { TemplateRouteUpdate } from "../type/TemplateRouteUpdate";
import { GetProjectsTemplateArgs } from "./dto/get-projects-template.args";
import { OrderProjectTemplateInput } from "./dto/order-projects-template-request.dto";
import {
  changeArrName,
  getOrderFindAllProjectsTemplate,
  getWhereFindAllProjectsTemplate,
} from "./projectsTemplate.utils";

@Injectable()
export class ProjectsTemplateService {
  private readonly projectsTemplateRepository: Repository<TemplateRouteProjectEntity>;
  private readonly projectsActionRepository: Repository<ProjectActionEntity>;
  private readonly projectsSubActionRepository: Repository<ProjectSubActionEntity>;
  private ProjectsServ: ProjectsService;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource, ProjectsServ: ProjectsService) {
    this.projectsTemplateRepository = dataSource.getRepository(TemplateRouteProjectEntity);
    this.projectsSubActionRepository = dataSource.getRepository(ProjectSubActionEntity);
    this.ProjectsServ = ProjectsServ;

    this.projectsActionRepository = dataSource.getRepository(ProjectActionEntity); //
  }

  async getAllProjectsTemplateRoute(
    args: GetProjectsTemplateArgs,
    pagination: PaginationInput,
    orderBy: OrderProjectTemplateInput,
    searchField?: string,
  ): Promise<PaginatedTempRouteProjectResponse> {
    const { pageNumber, pageSize, All } = pagination;
    const where = getWhereFindAllProjectsTemplate(args);
    const order = getOrderFindAllProjectsTemplate(orderBy);
    if (searchField?.trim()) {
      const [template, total] = await searchAllColumnWithoutRelation(
        this.projectsTemplateRepository,
        searchField,
        pageNumber,
        pageSize,
      );
      return paginatedResponseResult(template, pagination.pageNumber, pagination.pageSize, total);
    }
    const [data, total] = await getPaginatedData(
      this.projectsTemplateRepository,
      pageNumber,
      pageSize,
      {},
      All,
    );

    const arrAction = await this.getAllAction();
    data.forEach((item) => {
      const arrRoute = changeArrName(item, arrAction);
      item.doc_route_name = arrRoute;
    });
    return paginatedResponseResult(data, pagination.pageNumber, pagination.pageSize, total);
  }
  async getProjectsTemplateRouteById(id): Promise<TemplateRouteProjectType> {
    try {
      const Result = await this.projectsTemplateRepository.findOne({
        where: {
          id: id,
        },
      });
      const route = await this.ProjectsServ.getCorrectRoute(
        Result.type_document,
        Result.view_document,
      );

      const routeFilter = route.filter((el) => {
        return el.id == id;
      });
      const Route = routeFilter[0].doc_route_action;

      return {
        Result,
        Route,
      };
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }
  async getAllAction(): Promise<ProjectActionEntity[]> {
    return await this.projectsActionRepository.find({
      order: { name: "ASC" },
    });
  }
  async getAllSubAction(): Promise<ProjectSubActionEntity[]> {
    return await this.projectsSubActionRepository.find({
      where: {
        del: false,
      },
    });
  }

  async addTemplateRouteProject(AddTemplateRouteDtoDto): Promise<TemplateRouteProjectEntity> {
    const doc_route = AddTemplateRouteDtoDto.Action;
    const doc_route_name = doc_route.map((el) => {
      return el.action;
    });

    const res = this.projectsTemplateRepository.create({
      name: AddTemplateRouteDtoDto.name,
      view_document: AddTemplateRouteDtoDto.view_doc,
      type_document: AddTemplateRouteDtoDto.type_doc,
      doc_route: doc_route_name,
      doc_route_action: AddTemplateRouteDtoDto.Action,
    });

    return await this.projectsTemplateRepository.save(res);
  }

  async deleteTemplateRouteProject(id): Promise<HttpException | boolean> {
    try {
      const result = await this.projectsTemplateRepository.delete(id);

      return result.affected
        ? true
        : new HttpException(`${PREF_ERR}нет такого маршрута`, HttpStatus.BAD_REQUEST);
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async updateProjectTemplate(ProjectUpdate: TemplateRouteUpdate): Promise<boolean> {
    const doc_route = ProjectUpdate.doc_route_action;
    // const doc_route_name = doc_route.map((el) => {
    //   return el.action.id;
    // });
    // const x:ActionType = ProjectUpdate.doc_route_action.map(async (el)=>{
    //   const subAction =  await this.
    //
    //   return {
    //      action:el.action.id,
    //      action_name:el.action.label,
    //      subAction:el.subAction.
    //    }
    // })
    // try {
    // await this.projectsTemplateRepository.update(
    //   { id: ProjectUpdate.projectId },
    //   {
    //     type_document: ProjectUpdate.type_document,
    //     view_document: ProjectUpdate.view_document,
    //     doc_route: doc_route_name,
    //     // doc_route_action:
    //   },
    // );
    return true;
    // } catch (e) {
    //   console.log(e);
    //   return false;
    // }
  }
}
