import "dotenv/config";

import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";
import * as bcrypt from "bcryptjs";
import path from "path";
import * as process from "process";
import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { DataSource, EntityManager } from "typeorm";

import { AUTH } from "../../auth/auth.const";
import { GetAuthArgs } from "../../auth/dto/get-auth.args";
import { OrderAuthInput } from "../../auth/dto/order-auth-request.dto";
import { APIErrorCodeEnum } from "../../BACK_SYNC_FRONT/enum/enum.api";
import { PREF_ERR } from "../../common/enum/enum";
import { IPaginatedResponseResult } from "../../common/interfaces/pagination.interface";
import { customError } from "../../common/type/errorHelper.type";
import { globalSearchBuilderSignList } from "../../common/utils/utils.global.search";
import { getDataSourceAbonents, getDataSourceAdmin } from "../../database/datasource/tenancy/tenancy.utils";
import { Admin_abonentsEntity } from "../../entity/#adminBase/admin_abonents/admin_abonents.entity";
import { Admin_orgEntity } from "../../entity/#adminBase/admin_org/admin_org.entity";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { MenuOptionsEntity } from "../../entity/#organization/role/menuOptions.entity";
import { OperationEntity } from "../../entity/#organization/role/operation.entity";
import { PostEntity } from "../../entity/#organization/post/post.entity";
import { RolesEntity } from "../../entity/#organization/role/role.entity";
import { StaffEntity } from "../../entity/#organization/staff/staff.entity";
import { UserEntity } from "../../entity/#organization/user/user.entity";
import { paginatedResponseResult } from "../../pagination/pagination.service";
import { PaginationInput } from "../../pagination/paginationDTO";
import { wLogger } from "../logger/logging.module";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserType } from "./dto/user.type";
import { GetUserEntity } from "./user.type";
import { setQueryBuilderUser } from "./utils/user.utils";

export interface AllUserForEmp {
  id: number;
  name: string;
}
export interface IViewingAccess {
  viewing_access: string[];
  menu_ops_viewing: number[] | null;
}
@ObjectType()
export class AllUserForEmpClass {
  @Field()
  id: number;
  @Field()
  name: string;
}
const AppDataSource = new DataSource({
  type: "postgres",
  name: 'admin',
  host: process.env.DB_HOST,
  username: process.env.DB_LOGIN_ADMIN,
  password: process.env.DB_PASS_ADMIN,
  database: process.env.DB_DATABASE_ADMIN,
  entities: ["dist/**/*.entity.js"],
  synchronize: false,
});

AppDataSource.initialize().catch((err) => {
  wLogger.error("Error during Data Source initialization", err);
});

@Injectable()
export class UserService {
  async checkRole(url: string) {
    const dataSource = await getDataSourceAdmin(url);
    const role = await dataSource.manager.find(RolesEntity, {
      where: {
        name: "Администратор2",
      },
    });
    //const token = req?.get('Authorization')?.replace('Bearer', '').trim();
    //    const payload = new JwtService().decode(token)['payload'];

    return role.length;
  }

  async findCurrentPost(id_CurrentEmp, url: string) {
    const AppDataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_LOGIN_ADMIN,
      password: process.env.DB_PASS_ADMIN,
      database: url,
      logging: false,
      entities: [path.resolve(process.cwd(), "dist/**/*.entity.js")],
    });

    await AppDataSource.initialize();
    if (id_CurrentEmp === null) {
      return {
        id: 1,
        nm: "Нет назначения",
      };
    }

    const currentEmp = await AppDataSource.manager.findOne(EmpEntity, {
      where: {
        id: id_CurrentEmp,
      },
    });

    return await AppDataSource.manager.findOne(PostEntity, {
      select: { id: true, nm: true },
      where: {
        id: currentEmp.post_id,
      },
    });
  }

  /**
   * НАЙТИ ВАЛИДНУЮ ЗАПИСЬ АБОНЕНТА В ГЛОБАЛЬНОЙ БД ПО ЛОГИНУ
   * @returns гарантированный Admin_abonentsEntity или бросается ошибка
   * @param args
   */
  async getAbonetEntity(args: {
    login: string;
    manager?: EntityManager;
  }): Promise<Admin_abonentsEntity> {
    let ds: DataSource;
    let manager = args.manager;
    if (!args.manager) {
      ds = await getDataSourceAbonents();
      manager = ds.manager;
    }
    const abonentsEntity = await manager.findOne(Admin_abonentsEntity, {
      where: {
        username: args.login,
      },
      relations: {
        AdminOrg: true,
      },
    });

    if (!args.manager) {
      await ds.destroy();
    }
    if (!abonentsEntity) {
      throw new Error();
    }

    return abonentsEntity;

    // customError("Неверный логин или пароль", err);
  }

  /**
   * НАЙТИ ВАЛИДНУЮ ЗАПИСЬ USER В ЛОКАЛЬНОЙ БД
   * @returns гарантированный UserEntity или бросается ошибка
   * @param args
   */
  async getUserEntity(args: GetUserEntity): Promise<UserEntity> {
    try {
      let ds: DataSource;
      let manager = args.manager;
      if (!args.manager) {
        ds = await getDataSourceAdmin(args.org);
        manager = ds.manager;
      }

      const usersEntity = await manager.findOneBy(UserEntity, {
        main_id: args.abonentsEntity.id,
      });
      // if (!args.manager) { await ds.destroy(); }

      // блок проверок валидности записи
      if (!usersEntity) {
        customError("Пользователь не найден");
      }
      if (usersEntity.del) {
        customError("Пользователь удален");
      }
      if (usersEntity.isblocked) {
        customError("Пользователь заблокирован");
      }

      return usersEntity;
    } catch (err) {
      throw new UnauthorizedException(AUTH.ERR.USER.NONE);
    }
  }

  async userAccessList(current_emp_id: number, url: string): Promise<IViewingAccess> {
    const nullablePermission = {
      viewing_access: [],
      menu_ops_viewing: [],
    };
    if (current_emp_id === null) {
      return nullablePermission;
    }
    const dataSource = await getDataSourceAdmin(url);

    const userEmp = await dataSource.manager.findOne(EmpEntity, {
      select: {
        id: true,
        roles: true,
        is_admin: true,
      },
      where: { id: current_emp_id, del: false, temp: false },
      relations: {
        roles: {
          RoleOperations: {
            Operation: true,
          },
        },
      },
    });
    if (!userEmp?.roles) {
      return nullablePermission;
    }
    if (userEmp.is_admin) {
      const allOperation = await dataSource.manager.find(OperationEntity, {
        select: { function_name: true },
      });
      const allMenuOptions = await dataSource.manager.find(MenuOptionsEntity, {
        select: { id: true },
      });
      const allOperationRes = allOperation.map((el) => el.function_name);
      const allMenuOptionsRes = allMenuOptions.map((el) => el.id);

      return {
        viewing_access: allOperationRes,
        menu_ops_viewing: allMenuOptionsRes,
      };
    }
    /**
     *  получения списка доступных операций в записимости от текущего назначения
     */
    const function_name: any = userEmp.roles.map((el) =>
      el.RoleOperations.map(async (el) => {
        const operation = await el.Operation;

        return operation.function_name;
      }),
    );
    const menu_ops_viewing = userEmp.roles.map((el) => {
      return el.roles_menu_ops;
    });
    return {
      viewing_access: function_name.flat(),
      menu_ops_viewing: menu_ops_viewing.flat(),
    };
  }

  parseJwt(token: string): string {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async createUserInMainDb(LoginUserInputUp, token: IToken): Promise<HttpException | string> {
    // создание пользователя в базе admin
    LoginUserInputUp.username = LoginUserInputUp.username.toLowerCase();

    const dataSourceAdmin = await getDataSourceAbonents();
    const dataSourceOrg = await getDataSourceAdmin(token.url);
    const orgAdmin = await dataSourceAdmin.manager.findOne(Admin_orgEntity, {
      where: {
        name: token.url,
      },
    });
    const abonentRepository = dataSourceAdmin.getRepository(Admin_abonentsEntity);
    const StaffRepository = dataSourceOrg.getRepository(StaffEntity);
    const salt = bcrypt.genSaltSync(Number(process.env.JWT_SALT));
    const password = await bcrypt.hash(LoginUserInputUp.password, salt);
    const checkUserName = await abonentRepository.findOne({
      where: {
        username: LoginUserInputUp.username,
        org_id: orgAdmin.id,
      },
    });

    if (checkUserName) {
      return new HttpException(`${PREF_ERR} Login должен быть уникальный`, HttpStatus.BAD_REQUEST);
    }
    const staffItem = await StaffRepository.findOne({
      where: {
        id: LoginUserInputUp.staff_id,
      },
    });
    LoginUserInputUp.del = false;
    LoginUserInputUp.temp = false;
    LoginUserInputUp.password = password;
    LoginUserInputUp.name = staffItem.nm;
    LoginUserInputUp.lastname = staffItem.ln;
    LoginUserInputUp.url = token.url;
    LoginUserInputUp.org_id = orgAdmin.id;

    const abonentObj = await abonentRepository.save(LoginUserInputUp);

    return await this.createUserInCurrentDB(
      LoginUserInputUp,
      abonentObj.id,
      salt,
      dataSourceAdmin,
      dataSourceOrg,
      staffItem,
    );
  }

  /*
  создание пользователя в определённой базе данных (url)
   */
  async createUserInCurrentDB(
    LoginUserInputUp,
    abonentID: number,
    salt: string,
    connAdmin: DataSource,
    connCurrentDB: DataSource,
    staffItem: StaffEntity,
  ): Promise<HttpException | string> {
    try {
      const UserRepository = await connCurrentDB.getRepository(UserEntity);
      const StaffRepository = await connCurrentDB.getRepository(StaffEntity);
      const AbonentRepository = await connAdmin.getRepository(Admin_abonentsEntity);

      const { url, name, lastname, rt, id, ...result } = LoginUserInputUp;
      result.main_id = id;
      result.isblocked = false;
      result.salt = salt;
      result.user_id = LoginUserInputUp.staff_id;

      if (staffItem.user_id) {
        await AbonentRepository.delete({ id: abonentID });
        return new HttpException(
          `${PREF_ERR} Ошибка регистрации, у выбранного сотрудника есть пользователь`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const userSave = await UserRepository.save({ ...result });
      await UserRepository.update(userSave.id, { Staff: result.user_id });
      await StaffRepository.update(staffItem.id, { user_id: userSave.id });

      return `Пользователь зарегистрирован с ником ${LoginUserInputUp.username}`;
    } catch (e) {
      wLogger.error(e);
      return new HttpException(`${PREF_ERR} Ошибка регистрации`, HttpStatus.BAD_REQUEST);
    }
  }

  async getListUsers(
    token: IToken,
    args: GetAuthArgs,
    pagination: PaginationInput,
    orderBy: OrderAuthInput,
    searchField: string,
  ): Promise<IPaginatedResponseResult<UserEntity> | HttpException> {
    try {
      const url = token.url;
      const connOrg = await getDataSourceAdmin(url);

      const empID = token.current_emp_id;
      const { isblocked } = await connOrg.manager.findOne(UserEntity, {
        select: { isblocked: true },
        where: {
          current_emp_id: empID,
        },
      });

      if (isblocked) {
        throw new HttpException(AUTH.ERR.USER.BLOCK, APIErrorCodeEnum.auth_block);
      }

      const queryBuilder = connOrg.manager.createQueryBuilder(UserEntity, "user");
      const { pageNumber, pageSize, All } = pagination;
      if (searchField?.trim()) {
        globalSearchBuilderSignList(queryBuilder, searchField);
      } else {
        setQueryBuilderUser(args, orderBy, queryBuilder);
      }

      if (!All) {
        queryBuilder.skip((pageNumber - 1) * pageSize);
        queryBuilder.take(pageSize);
      }

      const [users, total] = await queryBuilder.getManyAndCount();

      return paginatedResponseResult(users, pageNumber, pageSize, total);
    } catch (e) {
      wLogger.error(e);
      return new HttpException(`${PREF_ERR}Ошибка получения данных`, HttpStatus.BAD_REQUEST);
    }
  }

  async deactivatedUser(id: number, flag: boolean, token: IToken): Promise<UserEntity> {
    const connOrg = await getDataSourceAdmin(token.url);
    const userRep = await connOrg.manager.getRepository(UserEntity);
    const user = await userRep.findOne({
      where: {
        id: id,
      },
    });

    if (flag) {
      await userRep.update(
        { id: id },
        {
          isblocked: flag,
        },
      );
    } else {
      await userRep.update(
        { id: id },
        {
          isblocked: flag,
        },
      );
    }

    return user;
  }

  async deleteUser(id: number, context: any): Promise<boolean | HttpException> {
    try {
      const org = context.req.headers.org;
      const dataSource = await getDataSourceAdmin(org);

      const { current_emp_id, main_id } = await dataSource.manager.findOne(UserEntity, {
        where: {
          id: id,
        },
      });
      await dataSource.manager.delete(UserEntity, { id: id });
      await dataSource.manager.delete(EmpEntity, { id: current_emp_id });
      // await dataSource.destroy();

      const connAuthMain = await getDataSourceAbonents();

      await connAuthMain.manager.delete(Admin_abonentsEntity, {
        id: main_id,
      });
      await connAuthMain.destroy();
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async getUserById(id: number, token: IToken): Promise<UserType> {
    const { url } = token;

    const dataSource = await getDataSourceAdmin(url);

    const user = await dataSource.manager.findOne(UserEntity, {
      where: {
        id: id,
      },
      relations: { Staff: true },
    });

    const staff = await user.Staff;
    return {
      id: id,
      username: user.username,
      Staff: staff,
    };
  }

  async updateUser(update: UpdateUserDto, token: IToken): Promise<UserType | HttpException> {
    const dataSourceAdmin = await getDataSourceAbonents();
    const dataSourceOrg = await getDataSourceAdmin(token.url);

    try {
      const preloadUser = await dataSourceOrg.manager.findOne(UserEntity, {
        where: {
          id: update.id,
        },
        relations: {
          Staff: true,
        },
      });
      if (preloadUser.username.toLowerCase() == update.username.toLowerCase()) {
        return new HttpException(`${PREF_ERR} Логин занят`, HttpStatus.BAD_REQUEST);
      }
      preloadUser.username = update.username;

      await dataSourceOrg.manager.transaction(async (manager) => {
        await manager.save(preloadUser);
      });

      await dataSourceAdmin.manager.transaction(async (manager) => {
        const { id } = await manager.findOne(Admin_abonentsEntity, {
          select: {
            id: true,
          },
          where: {
            id: preloadUser.main_id,
          },
        });
        const prealoadAbonent = await manager.preload(Admin_abonentsEntity, {
          id: id,
        });
        prealoadAbonent.username = update.username;
        await manager.save(prealoadAbonent);
      });
      const preloadStaff = await preloadUser.Staff;
      return {
        id: update.id,
        username: preloadUser.username,
        Staff: preloadStaff,
      };
    } catch (e) {
      return new HttpException(`${PREF_ERR} Ошибка Обновления`, HttpStatus.BAD_REQUEST);
    }
  }

  async changePassword(id: number, newPassword: string, token: IToken): Promise<boolean> {
    try {
      const dataSource = await getDataSourceAdmin(token.url);

      const salt = bcrypt.genSaltSync(Number(process.env.JWT_SALT));
      const newPassHash = await bcrypt.hash(newPassword, salt);
      await dataSource.manager.update(UserEntity, id, {
        password: newPassHash,
        salt: salt,
      });
      return true;
    } catch (e) {
      wLogger.error(e);
      return false;
    }
  }

  async changePasswordFromOld(
    id: number,
    oldPassword: string,
    newPassword: string,
    token: IToken,
  ): Promise<boolean | HttpException> {
    try {
      const dataSource = await getDataSourceAdmin(token.url);

      const salt = bcrypt.genSaltSync(Number(process.env.JWT_SALT));

      const currentUser = await dataSource.manager.findOne(UserEntity, { where: { id } });
      const oldPassHash = await bcrypt.compare(oldPassword, currentUser.password);
      if (!currentUser) return customError(`Ошибка смены пароля`);
      if (!oldPassHash) return customError(`Неверный пароль`);

      const newPassHash = await bcrypt.hash(newPassword, salt);
      await dataSource.manager.update(UserEntity, id, {
        password: newPassHash,
        salt: salt,
      });
      return true;
    } catch (e) {
      wLogger.error(e);
      return e;
    }
  }

  async getAllUserForEmp(context): Promise<AllUserForEmp[] | HttpException> {
    const org = context.req.headers.org;
    const dataSource = await getDataSourceAdmin(org);

    const userInCurrentDb = await dataSource.manager.find(UserEntity);
    try {
      // return userInCurrentDb.map((el) => {
      //   return {
      //     id: el.id,
      //     name: el.FIO,
      //   };
      // });
    } catch (e) {
      wLogger.error(e);
      return new HttpException(`${PREF_ERR} `, HttpStatus.BAD_REQUEST);
    }
  }
}
