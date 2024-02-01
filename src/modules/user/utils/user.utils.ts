import "dotenv/config";

import { SelectQueryBuilder } from "typeorm";

import { GetAuthArgs } from "../../../auth/dto/get-auth.args";
import { OrderAuthInput } from "../../../auth/dto/order-auth-request.dto";
import { OrderAuthEnum, SortEnum } from "../../../common/enum/enum";
import { UserEntity } from "../../../entity/#organization/user/user.entity";

export function setQueryBuilderUser(
  args: GetAuthArgs,
  orderBy: OrderAuthInput,
  queryBuilder: SelectQueryBuilder<UserEntity>,
): void {
  const { fio, dtc, login, personnal_number } = args;

  queryBuilder.leftJoinAndSelect("user.Staff", "Staff");
  queryBuilder.where("user.del = false");

  if (fio) {
    queryBuilder.andWhere(`(Staff.ln || ' ' || Staff.nm || ' ' || CONCAT(Staff.mn)) ILIKE :fio`, {
      fio: `%${fio}%`,
    });
  }

  if (dtc) {
    queryBuilder.andWhere(`"user"."dtc"::date = :dtc`, { dtc });
  }

  if (login) {
    queryBuilder.andWhere("user.username ILIKE :login", { login: `%${login}%` });
  }

  if (personnal_number) {
    queryBuilder.andWhere("Staff.personnal_number ILIKE :personnal_number", {
      personnal_number: `%${personnal_number}%`,
    });
  }

  getOrderAllUser(queryBuilder, orderBy);
}

function getOrderAllUser(
  queryBuilder: SelectQueryBuilder<UserEntity>,
  orderBy: OrderAuthInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("user.dtc", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderAuthEnum.fio:
      queryBuilder.orderBy({
        "Staff.ln": orderBy.sortEnum,
        "Staff.nm": orderBy.sortEnum,
        "Staff.mn": orderBy.sortEnum,
      });
      break;
    case OrderAuthEnum.dtc:
      queryBuilder.orderBy("user.dtc", orderBy.sortEnum);
      break;
    case OrderAuthEnum.login:
      queryBuilder.orderBy("user.username", orderBy.sortEnum);
      break;
    case OrderAuthEnum.personnal_number:
      queryBuilder.orderBy("Staff.personnal_number", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("user.dtc", SortEnum.DESC);
  }
}

// export const updateUserEntity = async (update: UpdateUserDto, token) => {
//   const connOrg = await connectDBOrg(token.url);
//
//   const userRepository = await connOrg.manager.getRepository(UserEntity);
//
//   const user = await userRepository.findOne({
//     where: {
//       id: update.id,
//     },
//   });
// await userRepository.update(
//   { id: update.id },
//   {
//     role: update?.roles,
//     username: update?.username || user.username,
//     ln: update?.lastname || user.ln,
//     nm: update?.name || user.nm,
//     email: update.email,
//     mn: update.middlename,
//   },
// );
//   return await userRepository.findOne({
//     where: {
//       id: update.id,
//     },
//   });
// };
// export const updateEmpEntity = async (
//   update: UpdateUserDto,
//   token,
//   user: UserEntity,
// ) => {
//   const connOrg = await connectDBOrg(token.url);
//   const empRepository = connOrg.manager.getRepository(EmpEntity);
//   const staffRepository = connOrg.manager.getRepository(StaffEntity);
//   const empRepositoryData = await empRepository.findOne({
//     relations: { roles: true },
//     where: {
//       id: user.current_emp_id,
//     },
//   });
//
//   const roleRepository = await connOrg.manager.getRepository(RolesEntity);
//   const roles = update.roles
//     ? await roleRepository.findBy({ id: In(update.roles) })
//     : empRepositoryData.roles;
//
//   empRepositoryData.roles = roles;
//   empRepositoryData.post_id = update?.post;
//   empRepositoryData.unit_id = update?.unit;
//   await empRepository.save(empRepositoryData);
//
//   const emp = await empRepository.findOne({
//     where: {
//       id: user.current_emp_id,
//     },
//   });
//   // await staffRepository.update(
//   //   { id: emp.staff_id },
//   //   {
//   //     ln: update?.lastname || emp.staff.ln,
//   //     mn: update?.middlename || emp.staff.mn,
//   //     nm: update?.name || emp.staff.nm,
//   //     eml: update?.email || emp.staff.eml,
//   //   },
//   // );
//   return await userGetOne(empRepository, user.current_emp_id);
// };
// export const AbonentEntity = async (
//   update: UpdateUserDto,
//   user: UserEntity,
// ) => {
//   const connAdmin = await connectDBOrg(process.env.DB_DATABASE_ADMIN);
//   const adminRep = await connAdmin.manager.getRepository(Admin_abonentsEntity);
//   const { lastname, username, name } = await adminRep.findOne({
//     where: {
//       id: user.main_id,
//     },
//   });
//   await adminRep.update(
//     { id: user.main_id },
//     {
//       username: update?.username || username,
//       lastname: update?.lastname || lastname,
//       name: update?.name || name,
//     },
//   );
//   return await adminRep.findOne({
//     where: {
//       id: user.main_id,
//     },
//   });
// };

// export function userGetOne(
//   empRep: Repository<EmpEntity>,
//   emp_id: number,
// ): Promise<EmpEntity> {
//   return empRep
//     .createQueryBuilder('emp')
//     .select()
//     .leftJoinAndSelect('emp.staff', 'staff')
//     .leftJoinAndSelect('emp.unit', 'unit')
//     .leftJoinAndSelect('emp.post', 'post')
//     .leftJoinAndSelect('emp.roles', 'roles', 'roles.del = false')
//     .where('emp.id = :emp_id', { emp_id })
//     .getOne();
// }

// export const updateUserEntity()

// подключение к базе данных в зависимости от названия базы
