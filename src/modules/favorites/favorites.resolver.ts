import { HttpException } from "@nestjs/common";
import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { IToken } from "src/BACK_SYNC_FRONT/auth";

import { Token } from "../../auth/decorator/token.decorator";
import { FavoritesEntity } from "../../entity/#organization/favorites/favorites.entity";
import { FavoritesService } from "./favorites.service";
import { PersonalInfo } from "./personalInfo.type";

@Resolver(() => FavoritesEntity)
export class FavoritesResolver {
  constructor(private favoritesService: FavoritesService) {}

  /**
   * Получить избранное
   */
  @Query(() => FavoritesEntity, {
    description: "Получить избранное",
  })
  async getFavorites(@Token() token: IToken): Promise<FavoritesEntity | HttpException> {
    return this.favoritesService.getFavorites(token);
  }

  /**
   * Получить информацию о пользователе для личного кабинета
   */
  @Query(() => PersonalInfo, {
    description: "Получить информацию о пользователе для личного кабинета",
  })
  async getPersonalInfo(@Token() token: IToken): Promise<PersonalInfo | HttpException> {
    return this.favoritesService.getPersonalInfo(token);
  }

  /**
   * Добавить или Удалить избранное
   */
  @Query(() => FavoritesEntity, {
    description: "Добавить или Удалить избранное",
  })
  async changeFavorites(
    @Token() token: IToken,
    @Args("docId", { nullable: true }) docId: number,
    @Args("jobId", { nullable: true }) jobId: number,
    @Args("projectId", { nullable: true }) projectId: number,
    @Args("userTableFavoriteIds", { nullable: true, type: () => Int })
    userTableFavoriteIds: number,
    @Args("empTableFavoriteIds", { nullable: true, type: () => Int })
    empTableFavoriteIds: number,
    @Args("orgTableFavoriteIds", { nullable: true, type: () => Int })
    orgTableFavoriteIds: number,
    @Args("addOrDelete", { nullable: true, description: "ADD - false, DELETE - true" })
    addOrDelete: boolean,
  ): Promise<FavoritesEntity | HttpException> {
    return this.favoritesService.changeFavorites(
      token,
      docId,
      jobId,
      projectId,
      userTableFavoriteIds,
      empTableFavoriteIds,
      orgTableFavoriteIds,
      addOrDelete,
    );
  }

  /**
   * Добавить или Удалить избранное (массив)
   */
  @Query(() => FavoritesEntity, {
    description: "Добавить или Удалить избранное (массив)",
  })
  async changeFavoritesArray(
    @Token() token: IToken,
    @Args("docIds", { nullable: true, type: () => [Int] }) docIds: number[],
    @Args("jobIds", { nullable: true, type: () => [Int] }) jobIds: number[],
    @Args("projectIds", { nullable: true, type: () => [Int] }) projectIds: number[],
    @Args("userTableFavoriteIds", { nullable: true, type: () => [Int] })
    userTableFavoriteIds: number[],
    @Args("empTableFavoriteIds", { nullable: true, type: () => [Int] })
    empTableFavoriteIds: number[],
    @Args("orgTableFavoriteIds", { nullable: true, type: () => [Int] })
    orgTableFavoriteIds: number[],
    @Args("addOrDelete", { nullable: true, description: "ADD - false, DELETE - true" })
    addOrDelete: boolean,
  ): Promise<FavoritesEntity | HttpException> {
    return this.favoritesService.changeFavoritesArray(
      token,
      docIds,
      jobIds,
      projectIds,
      userTableFavoriteIds,
      empTableFavoriteIds,
      orgTableFavoriteIds,
      addOrDelete,
    );
  }
}
