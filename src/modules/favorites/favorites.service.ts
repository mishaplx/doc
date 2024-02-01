import "dotenv/config";

import { HttpException, Inject, Injectable } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, Repository } from "typeorm";

import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { FavoritesEntity } from "../../entity/#organization/favorites/favorites.entity";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { wLogger } from "../logger/logging.module";
import { TypeDefaultFavoritesData, TypeDefaultFavoritesName } from "./interface/favorite.interface";
import { PersonalInfo } from "./personalInfo.type";

@Injectable()
export class FavoritesService {
  private readonly favoritesRepository: Repository<FavoritesEntity>;
  private readonly empRepository: Repository<EmpEntity>;
  private readonly staffRepository: Repository<StaffEntity>;
  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.favoritesRepository = dataSource.getRepository(FavoritesEntity);
    this.empRepository = dataSource.getRepository(EmpEntity);
    this.staffRepository = dataSource.getRepository(StaffEntity);
  }

  // Получить информацию для личного кабинета по токену
  async getPersonalInfo(token: IToken): Promise<PersonalInfo | HttpException> {
    try {
      const emp = await this.empRepository.findOne({ where: { id: token.current_emp_id } });
      const staff = await this.staffRepository.findOne({ where: { id: token.staff_id } });
      const unit = await emp.unit;
      return {
        fio: staff.fullFIO,
        post: (await emp.post).nm,
        unit: `${unit.code} ${unit.nm}`,
        phone: staff.phone,
        email: staff.eml,
        login: token.username,
        idUser: staff.user_id,
      };
    } catch (e) {
      wLogger.error(e);
    }
  }

  // Получить "Избранное" по токену
  async getFavorites(token: IToken): Promise<FavoritesEntity | HttpException> {
    try {
      return this.findFavoritesByToken(token);
    } catch (e) {
      wLogger.error(e);
    }
  }

  // Добавить иди удалить "Избранное"
  async changeFavorites(
    token: IToken,
    docId: number,
    jobId: number,
    projectId: number,
    userTableFavoriteId: number,
    empTableFavoriteId: number,
    orgTableFavoriteId: number,
    addOrDelete = false,
  ): Promise<FavoritesEntity | HttpException> {
    await this.isFavorite(token, docId);
    try {
      const favorites = await this.findFavoritesByToken(token);
      const newFavorites = this.checkAndModifyNewIDs(
        favorites,
        docId,
        jobId,
        projectId,
        userTableFavoriteId,
        empTableFavoriteId,
        orgTableFavoriteId,
        addOrDelete,
      );
      return this.saveNewFavorites(favorites, newFavorites);
    } catch (e) {
      wLogger.error(e);
    }
  }

  // Добавить иди удалить "Избранное"
  async changeFavoritesArray(
    token: IToken,
    docIds: number[],
    jobIds: number[],
    projectIds: number[],
    userTableFavoriteIds: number[],
    empTableFavoriteIds: number[],
    orgTableFavoriteIds: number[],
    addOrDelete = false,
  ): Promise<FavoritesEntity | HttpException> {
    try {
      const favorites = await this.findFavoritesByToken(token);
      const newFavorites = this.checkAndModifyNewIDsArray(
        favorites,
        docIds,
        jobIds,
        projectIds,
        userTableFavoriteIds,
        empTableFavoriteIds,
        orgTableFavoriteIds,
        addOrDelete,
      );
      return this.saveNewFavorites(favorites, newFavorites);
    } catch (e) {
      wLogger.error(e);
    }
  }

  // Проверить и добавить новые ID в "Избранное", если необходимо
  checkAndModifyNewIDs(
    favorites: FavoritesEntity,
    docId: number,
    jobId: number,
    projectId: number,
    userTableFavorite: number,
    empTableFavorite: number,
    orgTableFavorite: number,
    del = false,
  ): TypeDefaultFavoritesData {
    let newFavorites = favorites.favorites;
    if (docId) newFavorites = this.addFavoriteToArray("docId", docId, newFavorites, del);
    if (jobId) newFavorites = this.addFavoriteToArray("jobId", jobId, newFavorites, del);
    if (projectId)
      newFavorites = this.addFavoriteToArray("projectId", projectId, newFavorites, del);
    if (userTableFavorite)
      newFavorites = this.addFavoriteToArray(
        "userTableFavorite",
        userTableFavorite,
        newFavorites,
        del,
      );
    if (empTableFavorite)
      newFavorites = this.addFavoriteToArray(
        "empTableFavorite",
        empTableFavorite,
        newFavorites,
        del,
      );
    if (orgTableFavorite)
      newFavorites = this.addFavoriteToArray(
        "orgTableFavorite",
        orgTableFavorite,
        newFavorites,
        del,
      );
    return newFavorites;
  }

  // Проверить и добавить новые ID(массив) в "Избранное", если необходимо
  checkAndModifyNewIDsArray(
    favorites: FavoritesEntity,
    docIds: number[],
    jobIds: number[],
    projectIds: number[],
    userTableFavoriteIds: number[],
    empTableFavoriteIds: number[],
    orgTableFavoriteIds: number[],
    del = false,
  ): TypeDefaultFavoritesData {
    let newFavorites = favorites.favorites;
    if (docIds?.length) {
      for (const docId of docIds) {
        newFavorites = this.addFavoriteToArray("docId", docId, newFavorites, del);
      }
    }

    if (jobIds?.length) {
      for (const jobId of jobIds) {
        newFavorites = this.addFavoriteToArray("jobId", jobId, newFavorites, del);
      }
    }

    if (projectIds?.length) {
      for (const projectId of projectIds) {
        newFavorites = this.addFavoriteToArray("projectId", projectId, newFavorites, del);
      }
    }
    if (userTableFavoriteIds?.length) {
      for (const userTableFavoriteId of userTableFavoriteIds) {
        newFavorites = this.addFavoriteToArray(
          "userTableFavorite",
          userTableFavoriteId,
          newFavorites,
          del,
        );
      }
    }
    if (empTableFavoriteIds?.length) {
      for (const empTableFavoriteId of empTableFavoriteIds) {
        newFavorites = this.addFavoriteToArray(
          "empTableFavorite",
          empTableFavoriteId,
          newFavorites,
          del,
        );
      }
    }
    if (orgTableFavoriteIds?.length) {
      for (const orgTableFavoriteId of orgTableFavoriteIds) {
        newFavorites = this.addFavoriteToArray(
          "orgTableFavorite",
          orgTableFavoriteId,
          newFavorites,
          del,
        );
      }
    }

    return newFavorites;
  }

  // Добавить или удалить ID в "Избранное" по типу.
  addFavoriteToArray<T>(type: TypeDefaultFavoritesName, id: number, favorites: T, del = false): T {
    // Удаление
    if (del) favorites[type] = favorites[type].filter((item) => item !== id);
    // Добавление
    if (!del && !favorites[type]?.includes(id)) favorites[type].push(id);
    return favorites;
  }

  // Найди запись "Избранное" или создать новую, если отсутствует
  async findFavoritesByToken(token: IToken): Promise<FavoritesEntity> {
    const favoritesItem = await this.favoritesRepository.findOne({
      where: { emp_id: token.current_emp_id },
    });
    if (!favoritesItem) {
      return await this.createDeafaultFavorites(token.current_emp_id);
    }
    return favoritesItem;
  }

  private async createDeafaultFavorites(currentEmpId: number): Promise<FavoritesEntity> {
    const defaultFavorites: TypeDefaultFavoritesData = {
      docId: [],
      jobId: [],
      projectId: [],
      userTableFavorite: [],
      empTableFavorite: [],
      orgTableFavorite: [],
    };
    return await this.favoritesRepository.save({
      emp_id: currentEmpId,
      favorites: defaultFavorites,
    });
  }

  // Сохранить измененое "Избранное"
  async saveNewFavorites(favorites: FavoritesEntity, newFavorites): Promise<FavoritesEntity> {
    return this.favoritesRepository.save({ id: favorites.id, favorites: newFavorites });
  }

  async isFavorite(token: IToken, docId = null, jobId = null, projectId = null): Promise<boolean> {
    const { favorites } = await this.findFavoritesByToken(token);
    if (docId) {
      return Boolean(favorites["docId"].find((item: number) => item === docId));
    }
    if (jobId) {
      return Boolean(favorites["jobId"].find((item: number) => item === jobId));
    }
    if (projectId) {
      return Boolean(favorites["projectId"].find((item: number) => item === projectId));
    }
    //
    // if (projectId) {
    //   return Boolean(favorites["empTableFavorite"].find((item: string) => item === projectId));
    // }
  }
}
