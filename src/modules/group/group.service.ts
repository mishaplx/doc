import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { DataSource, Repository } from "typeorm";

import { PREF_ERR } from "../../common/enum/enum";
import { DATA_SOURCE } from "../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { EmpGroupingEntity } from "../../entity/#organization/emp_grouping/emp_grouping.entity";
import { GroupingEntity } from "../../entity/#organization/grouping/grouping.entity";
import {
  getPaginatedData,
  listPaginationData,
  paginatedResponseResult,
} from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { wLogger } from "../logger/logging.module";
import { GetGroupArgs } from "./dto/get-group.args";
import { OrderGroupInput } from "./dto/order-group-request.dto";
import { PaginatedGroupResponseDictionary } from "./dto/paginated-group-response-dictionary.dto";
import { PaginatedGroupResponse } from "./dto/pagination-group-response.dto";
import { IresponseGetGroupe, IresponseGetGroupeAll, resposneGetGroupe } from "./group.interface";

@Injectable()
export default class GroupService {
  private readonly groupRepository: Repository<GroupingEntity>;
  private EmpRepository: Repository<EmpEntity>;
  private EmpGroupRepository: Repository<EmpGroupingEntity>;
  private GroupRepository: Repository<GroupingEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.groupRepository = dataSource.getRepository(GroupingEntity);
    this.EmpRepository = dataSource.getRepository(EmpEntity);
    this.EmpGroupRepository = dataSource.getRepository(EmpGroupingEntity);
    this.GroupRepository = dataSource.getRepository(GroupingEntity);
  }

  async getAllGroup(pagination: PaginationInput, searchField?): Promise<PaginatedGroupResponse> {
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      if (searchField?.trim()) {
        pagination.All = true;
        const response = await listPaginationData({
          repository: this.groupRepository,
          pagination: pagination,
        });
        const responseWithSearch = [];
        for (const groupe of response.data) {
          if (
            groupe?.nm?.toLowerCase().includes(searchField.toLowerCase()) ||
            groupe?.units?.toLowerCase().includes(searchField.toLowerCase())
          ) {
            responseWithSearch.push(groupe);
          }
        }
        return paginatedResponseResult(
          responseWithSearch,
          pagination.pageNumber,
          pagination.pageSize,
          responseWithSearch.length,
        );
      }
    }
    const [group, total] = await getPaginatedData(
      this.groupRepository,
      pageNumber,
      pageSize,
      {},
      All,
    );
    const arrayGroupeId = group.map((el) => el.id);
    const infoGroupe = await this.groupRepository.query(`
            select CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn) AS staff_fio,
                   unit.code                                      AS code,
                   post.nm                                        AS post,
                   emp.id                                         AS idEmp,
                   unit.nm                                        AS unit,
                   grouping_id,
                   grouping.nm
            from sad.grouping grouping
                     LEFT JOIN sad.emp_grouping emp_grouping ON grouping.id = emp_grouping.grouping_id
                     LEFT JOIN sad.emp emp ON emp.id = emp_grouping.emp_id
                     LEFT JOIN sad.post post ON emp.post_id = post.id
                     LEFT JOIN sad.unit unit ON emp.unit_id = unit.id
                     LEFT JOIN sad.users users ON emp.user_id = users.id
                     LEFT JOIN sad.staff staff ON staff.id = users.user_id
            where emp_grouping.grouping_id IN (${arrayGroupeId})
              AND emp.del = false
              and emp.temp = false
              and (emp.de is null OR emp.de >= current_date) ORDER BY grouping.id
        `);
    const response = [];
    const keyPost = infoGroupe.reduce((acc, curr) => {
      const key = curr.nm;
      acc.set(key, [...(acc.get(key) ?? []), curr]);

      return acc;
    }, new Map<string, IresponseGetGroupe[]>());

    for (const key of keyPost.keys()) {
      const objKey: IresponseGetGroupeAll = {
        id: keyPost.get(key)[0].grouping_id,
        groupName: key,
        unit: String(keyPost.get(key)[0].code) + " " + keyPost.get(key)[0].post,
        user: keyPost.get(key),
      };
      response.push(objKey);
    }
    return paginatedResponseResult(response, pageNumber, pageSize, total);
  }

  async getGroupDictionary(
    args: GetGroupArgs,
    pagination: PaginationInput,
    order: OrderGroupInput,
    searchField?: string,
  ): Promise<PaginatedGroupResponseDictionary> {
    try {
      await this.updateGroupUnits();
      delete args.searchField;

      if (searchField?.trim()) {
        pagination.All = true;
        const response = await listPaginationData({
          repository: this.groupRepository,
          pagination: pagination,
          order: order ?? { id: "DESC" },
          filter: args,
        });
        const responseWithSearch = [];
        for (const groupe of response.data) {
          if (
            groupe?.nm?.toLowerCase().includes(searchField.toLowerCase()) ||
            groupe?.units?.toLowerCase().includes(searchField.toLowerCase())
          ) {
            responseWithSearch.push(groupe);
          }
        }
        return paginatedResponseResult(
          responseWithSearch,
          pagination.pageNumber,
          pagination.pageSize,
          responseWithSearch.length,
        );
      }

      return listPaginationData({
        repository: this.groupRepository,
        pagination: pagination,
        order: order ?? { id: "DESC" },
        filter: args,
      });
    } catch (e) {
      wLogger.error(e);
    }
  }

  async getGroupForCreate(): Promise<resposneGetGroupe> {
    const result: any = [];
    const emp: any = await this.EmpRepository.query(`
            select CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn) AS staff_fio,
                   unit.code                                      AS code,
                   post.nm                                        AS post,
                   emp.id                                         AS idEmp,
                   unit.nm                                        AS unit,
                   staff.personnal_number                         AS personnal_number
            from sad.emp emp
                     LEFT JOIN sad.unit unit ON emp.unit_id = unit.id
                     LEFT JOIN sad.post post ON emp.post_id = post.id
                     LEFT JOIN sad.users users ON emp.user_id = users.id
                     LEFT JOIN sad.staff staff ON staff.id = users.user_id
            where emp.del = false
              and emp.temp = false
              and (emp.de is null OR emp.de >= current_date)
              ORDER BY unit.code, unit.nm, staff.ln, staff.nm, staff.mn, post.nm`);
    const keyPost = emp.reduce((acc, curr) => {
      const key = curr.code + " " + curr.unit;
      acc.set(key, [...(acc.get(key) ?? []), curr]);

      return acc;
    }, new Map<string, IresponseGetGroupe[]>());
    for (const key of keyPost.keys()) {
      const objKey = {
        id: 0,
        unit: key,
        user: keyPost.get(key),
      };
      result.push(objKey);
    }
    return result;
  }

  async getGroupeById(idGroup: number): Promise<resposneGetGroupe> {
    const result: any = [];
    const infoGroupe = await this.groupRepository.query(
      `
                select CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn) AS staff_fio,
                       unit.code                                      AS code,
                       post.nm                                        AS post,
                       emp.id                                         AS idEmp,
                       unit.nm                                        AS unit,
                       grouping.id
                from sad.emp_grouping grouping
                         LEFT JOIN sad.emp emp ON emp.id = grouping.emp_id
                         LEFT JOIN sad.post post ON emp.post_id = post.id
                         LEFT JOIN sad.unit unit ON emp.unit_id = unit.id
                         LEFT JOIN sad.users users ON emp.user_id = users.id
                         LEFT JOIN sad.staff staff ON staff.id = users.user_id
                where grouping.grouping_id::integer = $1
                  and emp.del = false
                  and emp.temp = false
                  and (emp.de is null OR emp.de >= current_date)`,
      [idGroup],
    );
    const nameGroupe = await this.groupRepository.findOne({
      select: {
        nm: true,
      },
      where: {
        id: idGroup,
      },
    });
    const keyPost = infoGroupe.reduce((acc, curr) => {
      const key = curr.code + " " + curr.unit;
      acc.set(key, [...(acc.get(key) ?? []), curr]);

      return acc;
    }, new Map<string, IresponseGetGroupe[]>());

    for (const key of keyPost.keys()) {
      const objKey: IresponseGetGroupe = {
        unit: key,
        id: idGroup,
        groupName: nameGroupe.nm,
        user: keyPost.get(key),
      };
      result.push(objKey);
    }
    return result;
  }

  async updateGroupUnits(): Promise<void> {
    //const empGroup = await this.EmpGroupRepository.find();
    const groups = await this.groupRepository.find();
    for (const group of groups) {
      const infoGroupe = await this.groupRepository.query(`
        select CONCAT(staff.ln, ' ', staff.nm, ' ', staff.mn) AS fio,
               unit.code                                      AS code,
               post.nm                                        AS post,
               emp.id                                         AS emp_id,
               unit.nm                                        AS unit,
               staff.personnal_number                         AS personnal_number
        from sad.grouping grouping
               LEFT JOIN sad.emp_grouping emp_grouping ON grouping.id = emp_grouping.grouping_id
               LEFT JOIN sad.emp emp ON emp.id = emp_grouping.emp_id
               LEFT JOIN sad.post post ON emp.post_id = post.id
               LEFT JOIN sad.unit unit ON emp.unit_id = unit.id
               LEFT JOIN sad.users users ON emp.user_id = users.id
               LEFT JOIN sad.staff staff ON staff.id = users.user_id
        where emp_grouping.grouping_id = ${group.id}
          AND emp.del = false
          and emp.temp = false
          and (emp.de is null OR emp.de >= current_date)
        ORDER BY grouping.id
        `);

      // Подразделения
      const unitsArray = [];
      for (const user of infoGroupe) {
        if (!user.code) user.code = "";
        if (!user.fio) user.fio = "";
        unitsArray.push(`${user.code}/${user.fio}`);
      }
      const unitsString = unitsArray.join(", ");

      // Юзеры
      const usersArray = [];
      const keyPost = infoGroupe.reduce((acc, curr) => {
        const key = curr.nm;
        acc.set(key, [...(acc.get(key) ?? []), curr]);

        return acc;
      }, new Map<string, IresponseGetGroupe[]>());
      console.log(keyPost);
      for (const key of keyPost.keys()) {
        usersArray.push(...keyPost.get(key));
      }
      await this.groupRepository.save({ id: group.id, units: unitsString, Users: usersArray });
    }
  }

  async deleteGroup(id): Promise<boolean | HttpException> {
    try {
      await this.EmpGroupRepository.delete({
        grouping_id: id,
      });

      await this.groupRepository.delete({
        id: id,
      });
      return true;
    } catch (e) {
      return new HttpException(PREF_ERR + "невозможно удалить группу", HttpStatus.BAD_REQUEST);
    }
  }

  async addUserInGroup(
    idUserArr: number[],
    idGroup: number | null,
    nameGroupe: string,
  ): Promise<GroupingEntity | HttpException> {
    try {
      // при существовании idGroup мы обновляем группу
      if (idGroup) {
        await this.GroupRepository.update({ id: idGroup }, { nm: nameGroupe });
        await this.EmpGroupRepository.delete({
          grouping_id: idGroup,
        });
        for (const idUser of idUserArr) {
          await this.EmpGroupRepository.save({
            emp_id: idUser,
            grouping_id: idGroup,
          });
        }
      } else {
        // создаём группу
        const groupe = await this.GroupRepository.save({
          nm: nameGroupe,
          dtc: new Date(),
          del: false,
          temp: false,
        });

        for (const idUser of idUserArr) {
          await this.EmpGroupRepository.save({
            emp_id: idUser,
            grouping_id: groupe.id,
          });
        }
        idGroup = groupe.id;
      }
      return await this.GroupRepository.findOne({
        where: {
          id: idGroup,
        },
      });
    } catch (e) {
      return new HttpException(PREF_ERR + "невозможно добавление в группу", HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUserInGroup(idUser: number, idGroup: number) {
    const res = await this.EmpGroupRepository.delete({
      emp_id: idUser,
      grouping_id: idGroup,
    });

    return res
      ? new HttpException(PREF_ERR + "пользователь удалён из группы", HttpStatus.OK)
      : new HttpException(PREF_ERR + "невозможно удаление из группу", HttpStatus.BAD_REQUEST);
  }

  async getAllUserInCurrentGroupe(id: number): Promise<EmpGroupingEntity[]> {
    return await this.EmpGroupRepository.find({
      where: {
        grouping_id: id,
      },
    });
  }
}
