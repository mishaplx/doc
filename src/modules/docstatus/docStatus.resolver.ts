import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { DocStatusEntity } from "../../entity/#organization/docstatus/docStatus.entity";
import { DocStatusService } from "./docStatus.service";
import { DocStatusUpdate } from "./dto/docStatusDTO";
@UseGuards(DeactivateGuard)
@Resolver(() => DocStatusEntity)
export class DocStatusResolver {
  constructor(private docStatusServ: DocStatusService) {}

  /**
   * Получение списка статусов документа
   */
  @Query(() => [DocStatusEntity], {
    description: "Получение списка статусов документа",
  })
  async getAllDocStatus(): Promise<DocStatusEntity[]> {
    return this.docStatusServ.getAllDocStatus();
  }

  /**
   * Создание статуса документов
   */
  @Mutation(() => DocStatusEntity, {
    description: "Создание статуса документов",
  })
  async createDocStatus(): Promise<DocStatusEntity> {
    return this.docStatusServ.createTypeDoc();
  }

  /**
   * Обновление статуса документов
   * @param docStatusId id статуса
   * @param input новые данные статуса
   */
  @Mutation(() => DocStatusEntity, {
    description: "Обновление статуса документов",
  })
  async updateDocStatus(
    @Args("docStatusId", {
      type: () => Int,
      description: "id статуса",
    })
    docStatusId: number,
    @Args("input", {
      description: "Новые данные статуса",
    })
    input: DocStatusUpdate,
  ): Promise<DocStatusEntity> {
    return this.docStatusServ.updateTypeDoc(docStatusId, input);
  }

  /**
   * Удаление статуса документов
   * @param id id записи статуса
   */
  @Mutation(() => DocStatusEntity, {
    description: "Удаление статуса документов",
    nullable: true,
  })
  deleteDocStatus(
    @Args("id", {
      description: "id записи статуса",
    })
    id: number,
  ): Promise<DocStatusEntity> {
    return this.docStatusServ.deleteTypeDoc(id);
  }
}
