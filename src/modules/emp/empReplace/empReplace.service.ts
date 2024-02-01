import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Brackets, DataSource, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";

import { PREF_ERR } from "../../../common/enum/enum";
import { globalSearchBuilderEmpReplace } from "../../../common/utils/utils.global.search";
import { DATA_SOURCE } from "../../../database/datasource/tenancy/tenancy.symbols";
import { EmpEntity } from "../../../entity/#organization/emp/emp.entity";
import { EmpReplaceEntity } from "../../../entity/#organization/emp_replace/emp_replace.entity";
import { PostEntity } from "../../../entity/#organization/post/post.entity";
import { UserEntity } from "../../../entity/#organization/user/user.entity";
import { UserAllEmpEntity } from "../../../entity/#organization/userAllEmp/userAllEmp.entity";
import { paginatedResponseResult } from "../../../pagination/pagination.service";
import { PaginationInput } from "../../../pagination/paginationDTO";
import { wLogger } from "../../logger/logging.module";
import {
  getAllEmpForCurrentUser,
  getEmpInterface,
  IgetAllEmpForCurrentUser,
} from "../empReplace.interface";
import { CreateEmpReplaceDto } from "./dto/createEmpReplace.dto";
import { GetListEmpReplace } from "./dto/get-list-emp-replace";
import { OrderEmpReplaceInput } from "./dto/order-emp-replace-request.dto";
import { PaginationEmpReplaceDto } from "./dto/pagination-emp-replace.dto";
import { UpdateEmpReplaceDto } from "./dto/updateEmpReplace.dto";
import { setQueryBuilderEmpReplace } from "./empReplace.utils";

@Injectable()
export class EmpReplaceService {
  private readonly empRepository: Repository<EmpEntity>;
  private readonly empReplaceRepository: Repository<EmpReplaceEntity>;
  private readonly userAllEmpRepository: Repository<UserAllEmpEntity>;
  private readonly userRepository: Repository<UserEntity>;

  constructor(@Inject(DATA_SOURCE) dataSource: DataSource) {
    this.empRepository = dataSource.getRepository(EmpEntity);
    this.empReplaceRepository = dataSource.getRepository(EmpReplaceEntity);
    this.userRepository = dataSource.getRepository(UserEntity);
    this.userAllEmpRepository = dataSource.getRepository(UserAllEmpEntity);
    this.userRepository = dataSource.getRepository(UserEntity);
  }

  async getAllEmpReplace(
    args: GetListEmpReplace,
    pagination: PaginationInput,
    orderBy: OrderEmpReplaceInput,
    searchField?: string,
  ): Promise<PaginationEmpReplaceDto> {
    const queryBuilder = this.empReplaceRepository.createQueryBuilder("emp_replace");
    const { pageNumber, pageSize, All } = pagination;
    if (searchField?.trim()) {
      globalSearchBuilderEmpReplace(queryBuilder, searchField);
    } else {
      setQueryBuilderEmpReplace(args, orderBy, queryBuilder);
    }
    if (!All) {
      queryBuilder.skip((pageNumber - 1) * pageSize);
      queryBuilder.take(pageSize);
    }
    const [orgs, total] = await queryBuilder.getManyAndCount();

    return paginatedResponseResult(orgs, pageNumber, pageSize, total);
  }

  async creatEmpReplace(empReplaceDto: CreateEmpReplaceDto): Promise<EmpReplaceEntity> {
    try {
      const emp_who = await this.empRepository.findOne({
        //TODO Кто заменяет
        select: {
          id: true,
          user_id: true,
        },
        where: {
          del: false,
          temp: false,
          user_id: empReplaceDto.userWho,
          post_id: empReplaceDto.postWho,
        },
      });

      const emp_whom = await this.empRepository.findOne({
        //TODO КОГО заменяют
        select: {
          id: true,
          user_id: true,
        },
        where: {
          del: false,
          temp: false,
          user_id: empReplaceDto.userWhom,
          post_id: empReplaceDto.postWhom,
        },
      });

      empReplaceDto.date_end.setHours(23);
      empReplaceDto.date_end.setMinutes(59);
      empReplaceDto.date_end.setSeconds(59);

      const empReplaceData = this.empReplaceRepository.create({
        emp_who: emp_who.id,
        emp_whom: emp_whom.id,
        date_start: empReplaceDto.date_start,
        date_end: empReplaceDto.date_end,
      });

      await this.checkDublicate(empReplaceData);

      const empReplaceEntity = await this.empReplaceRepository.save(empReplaceData);

      await this.userAllEmpRepository.save({
        replaceEmp: empReplaceEntity.id,
        user: emp_who.user_id,
      });

      return empReplaceEntity;
    } catch (e) {
      wLogger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  private async checkDublicate(empReplaceData: EmpReplaceEntity) {
    const empReplaceEntitys = await this.empReplaceRepository.find({
      where: {
        emp_who: empReplaceData.emp_who,
        emp_whom: empReplaceData.emp_whom,
        del: false,
      },
    });

    const checkTime = empReplaceEntitys
      .map((empReplace) => {
        return this.isTimeRangeIncluded(
          empReplaceData.date_start > empReplace.date_end,
          empReplaceData.date_end < empReplace.date_start,
        );
      })
      .some((item) => {
        return item === false;
      });

    if (checkTime) {
      throw new HttpException(`${PREF_ERR}Ошибка даты`, HttpStatus.BAD_REQUEST);
    }
  }
  private isTimeRangeIncluded(a: boolean, b: boolean): boolean {
    return (a || b) && !(a && b);
  }

  async updateEmpReplace(
    UpdateEmpReplaceDto: UpdateEmpReplaceDto,
  ): Promise<EmpReplaceEntity | HttpException> {
    // try {

    await this.empReplaceRepository.update(UpdateEmpReplaceDto.id, {
      date_end: UpdateEmpReplaceDto.date_end,
    });
    return this.empReplaceRepository.findOne({
      where: {
        id: UpdateEmpReplaceDto.id,
      },
    });
    // } catch (e) {
    //   console.log(e);
    //   return new HttpException(PREF_ERR + 'ошибка обнавления', HttpStatus.BAD_REQUEST);
    // }
  }

  async deleteEmpReplace(id: number): Promise<boolean | HttpException> {
    try {
      const deleteEmpReplace = await this.empReplaceRepository.findOne({
        where: {
          id: id,
        },
      });
      await this.empReplaceRepository.update(id, { del: true });
      const emp = await deleteEmpReplace.Emp_who;

      await this.userAllEmpRepository.delete({
        replaceEmp: deleteEmpReplace.emp_whom,
        user: emp.user_id,
      });
      return true;
    } catch (e) {
      wLogger.error(e);
      return new HttpException(PREF_ERR + "ошибка удаления", HttpStatus.BAD_REQUEST);
    }
  }

  async getEmpReplaceById(id: number): Promise<EmpReplaceEntity> {
    return this.empReplaceRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async activateEmpReplace(id: number, flag: boolean): Promise<boolean | HttpException> {
    try {
      await this.empReplaceRepository.update({ id: id }, { activate: flag });
      return true;
    } catch (e) {
      return new HttpException({}, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllEmpForCurrentUser(token: IToken): Promise<getAllEmpForCurrentUser[] | HttpException> {
    try {
      return await this.prepareEmp(token);
    } catch (e) {
      wLogger.error(e);
      throw new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async prepareEmp(token: IToken): Promise<IgetAllEmpForCurrentUser[]> {
    const currentDate = new Date();

    const userAllEmp = await this.userAllEmpRepository.query(
      ` SELECT *
              FROM sad.users_all_emp as "userAllEmp"
              WHERE "userAllEmp"."user" = $1`,
      [token.user_id],
    );

    let emps = userAllEmp
      .filter((item: UserAllEmpEntity) => item.emp !== null && item.emp !== undefined)
      .map((item: UserAllEmpEntity) => item.emp);

    emps = await this.checkEmp(emps);

    const empsResult = await this.generateStateEmpUser(emps, token);

    let empsReplace = userAllEmp
      .filter((item: UserAllEmpEntity) => item.replaceEmp !== null && item.replaceEmp !== undefined)
      .map((item: UserAllEmpEntity) => item.replaceEmp);

    empsReplace = await this.checkEmpReplace(empsReplace);

    empsReplace = empsReplace.filter((emp: EmpReplaceEntity) => {
      if (emp === null) {
        return false;
      }

      return (
        !emp.del &&
        !emp.temp &&
        emp.activate &&
        emp.date_start <= currentDate &&
        emp.date_end >= currentDate
      );
    });

    const empsReplaceResult = await this.generateStateEmpReplaceUser(empsReplace, token);

    if (empsResult.length && empsReplaceResult.length) {
      return empsResult.concat(empsReplaceResult);
    }
    return empsResult;
  }

  private async generateStateEmpUser(
    emps: EmpEntity[],
    token: IToken,
    replace = false,
  ): Promise<IgetAllEmpForCurrentUser[]> {
    let selected = false;
    const result = [];

    for (const employee of emps) {
      selected = token.current_emp_id === employee.id;

      const user = await employee.User;
      const post = await employee.post;
      const staff = await user.Staff;
      const repsonalNumber = staff.personnal_number;

      const data: IgetAllEmpForCurrentUser = {
        idEmp: employee.id,
        idUser: user.id,
        idPost: post.id,
        postNm: post.nm,
        repsonalNumber: repsonalNumber,
        selected: selected,
        replace: replace,
      };

      result.push(data);
    }
    return result;
  }

  private async generateStateEmpReplaceUser(
    emps: EmpReplaceEntity[],
    token: IToken,
  ): Promise<IgetAllEmpForCurrentUser[]> {
    let selected = false;
    const result = [];

    for (const employee of emps) {
      selected = token.current_emp_id === employee.emp_whom;

      const empWhom = await employee.Emp_whom;
      const user = await empWhom.User;
      const post = await empWhom.post;
      const staff = await user.Staff;
      const repsonalNumber = staff.personnal_number;

      const data: IgetAllEmpForCurrentUser = {
        idEmp: employee.emp_whom,
        idUser: user.id,
        idPost: post.id,
        postNm: post.nm,
        repsonalNumber: repsonalNumber,
        selected: selected,
        replace: true,
      };

      result.push(data);
    }
    return result;
  }

  private async checkEmp(emps: number[]): Promise<EmpEntity[]> {
    const queryBuilder = this.empRepository.createQueryBuilder("emp");

    const res = [];
    if (emps.length) {
      for (const id of emps) {
        queryBuilder.where("emp.id = :id", { id });
        queryBuilder.andWhere("emp.del = false");
        queryBuilder.andWhere("emp.temp = false");

        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.orWhere(`emp.de IS NULL`);
            qb.orWhere(`emp.de >= CURRENT_DATE`);
          }),
        );
        const emp = await queryBuilder.getOne();
        if (emp) {
          res.push(emp);
        }
      }
      return res;
    }

    return [];
  }

  private async checkEmpReplace(empsReplace: number[]): Promise<EmpReplaceEntity[]> {
    if (empsReplace.length) {
      const promises = empsReplace.map(async (id: number) => {
        return await this.empReplaceRepository.findOne({
          where: {
            id,
          },
        });
      });
      return Promise.all(promises);
    }
    return [];
  }

  async SetEmpForCurrentUser(token: IToken, idEmp: number): Promise<boolean | HttpException> {
    try {
      await this.userRepository.update(
        {
          id: token.user_id,
        },
        {
          current_emp_id: idEmp,
        },
      );

      return true;
    } catch (e) {
      wLogger.error(e);
      throw new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getEmp(id: number): Promise<getEmpInterface> {
    try {
      const empEntities = await this.empRepository
        .createQueryBuilder("emp")
        .select()
        .leftJoinAndSelect("emp.post", "Post_al")
        .where(
          `emp.del=false and emp.temp = false and  emp.user_id = ${id} and (emp.de is null OR emp.de >= current_date)`,
        )
        .orderBy("Post_al.nm", "ASC")
        .getMany();
      const posts: Promise<PostEntity>[] = empEntities.map((el) => el.post);

      return { posts: posts, userId: id };
    } catch (e) {
      wLogger.error(e);
      throw new HttpException({}, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
