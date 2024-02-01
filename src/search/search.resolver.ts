import { UseGuards } from "@nestjs/common";
import { Args, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../auth/guard/deactivate.guard";
import { AttributiveSearchElementEntity } from "../entity/#organization/attributive-search/attributive_search_element.entity";
import { FileVersionEntity } from "../entity/#organization/file/fileVersion.entity";
import { JobEntity } from "../entity/#organization/job/job.entity";
import { ProjectEntity } from "../entity/#organization/project/project.entity";
import { DocViewEntity } from "../entity/#organization/views/docView.entity";
import { SearchService } from "./search.service";
@UseGuards(DeactivateGuard)
@Resolver()
export class SearchResolver {
  constructor(private searchServ: SearchService) {}

  @Query(() => [FileVersionEntity], {
    description: "Полнотекстовый поиск",
  })
  async fullTextSearch(
    @Args("text") text: string,
    @Args("tdoc", { nullable: true }) tdoc: number,
    @Args("kdoc", { nullable: true }) kdoc: number,
    @Args("from", { nullable: true }) from: Date,
    @Args("to", { nullable: true }) to: Date,
    @Args("isAllWords") isAllWords: boolean,
    @Args("inDocuments") inDocuments: boolean,
    @Args("inJobs") inJobs: boolean,
    @Args("inProjects") inProjects: boolean,
    @Args("isFileNames", { nullable: true }) isFileNames?: boolean,
  ): Promise<FileVersionEntity[]> {
    return this.searchServ.fullTextSearch(
      text,
      tdoc,
      kdoc,
      from,
      to,
      isAllWords,
      isFileNames,
      inDocuments,
      inJobs,
      inProjects,
    );
  }

  @Query(() => [DocViewEntity], {
    description: "Атрибутивный поиск по документам",
  })
  async attributiveDocSearch(@Args("request") request: string): Promise<DocViewEntity[]> {
    return this.searchServ.attributiveDocSearch(request);
  }

  @Query(() => [ProjectEntity], {
    description: "Атрибутивный поиск по проектам",
  })
  async attributiveProjectSearch(@Args("request") request: string): Promise<ProjectEntity[]> {
    return this.searchServ.attributiveProjectSearch(request);
  }

  @Query(() => [JobEntity], {
    description: "Атрибутивный поиск по поручениям",
  })
  async attributiveJobSearch(@Args("request") request: string): Promise<JobEntity[]> {
    return this.searchServ.attributiveJobSearch(request);
  }

  @Query(() => [AttributiveSearchElementEntity], {
    description: "Получение списка атрибутов",
  })
  async getAttributes(
    @Args("entity", { nullable: true }) entity: string,
  ): Promise<AttributiveSearchElementEntity[]> {
    return this.searchServ.getAttributes(entity);
  }
}
