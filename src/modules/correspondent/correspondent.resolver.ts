import { HttpException, UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ActionsDoc } from "src/BACK_SYNC_FRONT/actions/actions.doc";
import { Access } from "src/modules/access/guard/access.guard";
import { Token } from "../../auth/decorator/token.decorator";
import { DeactivateGuard } from "../../auth/guard/deactivate.guard";
import { PoliceGuard } from "../../auth/guard/police.guard";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { ResponseType } from "../../common/type/errorHelper.type";
import { CorrespondentEntity } from "../../entity/#organization/correspondent/correspondent.entity";
import { DocEntity } from "../../entity/#organization/doc/doc.entity";
import { OrgEntity } from "../../entity/#organization/org/org.entity";
import { CorrespondentService } from "./correspondent.service";
import { CorrespondentCreate, CorrespondentUpdate } from "./dto/correspondentDTO";

@UseGuards(DeactivateGuard)
@Resolver()
export class CorrespondentResolver {
  constructor(private correspondentServ: CorrespondentService) {}

  // /**
  //  * Получение списка корреспондентов по id документа
  //  * @param docId id документа
  //  */
  // @Query(() => [OrgEntity], {
  //   description: 'Получение списка корреспондентов по id документа',
  // })
  // getCorrespondentsByDocId(
  //   @Args('doc_id', {
  //     type: () => Int,
  //     description: 'id документа',
  //   })
  //   doc_id: number,
  // ): Promise<OrgEntity[]> {
  //   return this.correspondentServ.getCorrespondentsByDocId(doc_id);
  // }

  @Query(() => [CorrespondentEntity], {
    description: "Получение списка корреспондентов по id документа",
  })
  getCorrespondentsByDoc(
    @Args("doc_id", {
      type: () => Int,
      description: "id документа",
    })
    doc_id: number,
  ): Promise<CorrespondentEntity[]> {
    return this.correspondentServ.getCorrespondentsByDoc(doc_id);
  }

  /**
   * КОРРЕСПОНДЕНТ: ДОБАВИТЬ
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => CorrespondentEntity, {
    description: "Добавление корреспондента",
  })
  // @Access(ActionsDoc.DOC_CORR_ADD)
  addCorrespondent(
    @Token() token: IToken,
    @Args("correspondentItem", {
      type: () => CorrespondentCreate,
      description: "Новые данные корреспондента",
    })
    correspondentItem: CorrespondentCreate,
  ): Promise<CorrespondentEntity> {
    return this.correspondentServ.addCorrespondent(correspondentItem, token);
  }

  /**
   * Редактирование корреспондента
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => CorrespondentEntity, {
    description: "Редактирование корреспондента",
  })
  updateCorrespondent(
    @Args("correspondentId", {
      description: "id корреспондента",
      type: () => Int,
    })
    correspondentId: number,
    @Args("correspondentItem", {
      description: "Новые данные корреспондента",
    })
    correspondentItem: CorrespondentUpdate,
  ): Promise<CorrespondentEntity> {
    return this.correspondentServ.updateCorrespondent(correspondentId, correspondentItem);
  }

  /**
   * Удаление корреспондента
   * @param correspondentId id корреспондента
   */
  @UseGuards(PoliceGuard)
  @Mutation(() => DocEntity, {
    description: "Удаление корреспондента",
  })
  deleteCorrespondent(
    @Args("correspondentId", {
      description: "id корреспондента",
      type: () => Int,
    })
    correspondentId: number,
  ): Promise<Promise<CorrespondentEntity> | Promise<HttpException>> {
    return this.correspondentServ.deleteCorrespondent(correspondentId);
  }

  @Query(() => [OrgEntity], {
    description: "получение всех названий организаций",
  })
  getAllOrgName(): Promise<OrgEntity[]> {
    return this.correspondentServ.getAllOrgName();
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => ResponseType, {
    description: "Добавление доп. корреспондента в карточке",
  })
  addCorrespondentInCard(
    @Args("doc_id", { type: () => Int, description: "id документа" })
    doc_id: number,
    @Args("org_id", { type: () => Int, description: "id организации" })
    org_id: number,
  ): Promise<ResponseType> {
    return this.correspondentServ.addConInCard(doc_id, org_id);
  }
  @UseGuards(PoliceGuard)
  @Mutation(() => ResponseType, {
    description: "Удаление доп. корреспондента в карточке",
  })
  deleteCorrespondentInCard(
    @Args("doc_id", { type: () => Int, description: "id документа" })
    doc_id: number,
    @Args("org_id", { type: () => Int, description: "id организации" })
    org_id: number,
  ): Promise<ResponseType> {
    return this.correspondentServ.deleteCorrespondentInCard(doc_id, org_id);
  }

  @Query(() => [CorrespondentEntity], {
    description: "получение всех корреспондентов в зависимости от типа отправки",
  })
  getAllCorrOfSendEmail(
    @Args("doc_id", { type: () => Int, description: "id документа" }) doc_id: number,
    @Args("typeSend", { type: () => Int, description: "id типа отправки" }) typeSend: number,
  ): Promise<CorrespondentEntity[]> {
    return this.correspondentServ.getAllCorrOfSendEmail(doc_id, typeSend);
  }
}
