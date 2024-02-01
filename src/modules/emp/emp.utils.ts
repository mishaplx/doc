import { MiddlewareContext, NextFn } from "@nestjs/graphql";
import { SelectQueryBuilder } from "typeorm";

import { OrderEmpEnum, SortEnum } from "../../common/enum/enum";
import { EmpEntity } from "../../entity/#organization/emp/emp.entity";
import { GetEmpArgs } from "./dto/get-emp.args";
import { OrderEmpInput } from "./dto/order-emp-request.dto";

export async function changeDateToEndDay(ctx: MiddlewareContext, next: NextFn) {
  const value = await next();
  const year = value.getFullYear();
  const mounth = value.getMonth();
  const day = value.getDate();
  // // 1 Jan 2011, 00:00:00
  return new Date(year, mounth, day, 23, 59, 59, 0);
}

export function setQueryBuilderEmp(
  args: GetEmpArgs,
  orderBy: OrderEmpInput,
  queryBuilder: SelectQueryBuilder<EmpEntity>,
): void {
  const { post, fio, unit, role, db, de, personnal_number } = args;

  queryBuilder.leftJoinAndSelect("emp.post", "Post");
  queryBuilder.leftJoinAndSelect("emp.unit", "Unit");
  queryBuilder.leftJoinAndSelect("emp.User", "User");
  queryBuilder.leftJoinAndSelect("User.Staff", "Staff");
  queryBuilder.leftJoinAndSelect("emp.roles", "Roles");
  queryBuilder.leftJoinAndSelect("emp.RlsGroups", "RlsGroups");

  queryBuilder.where(
    "emp.del=false and emp.temp = false and ( emp.de is null OR emp.de >= current_date)",
  );

  if (post) {
    queryBuilder.andWhere("emp.post_id = :post", { post });
  }

  if (personnal_number) {
    queryBuilder.andWhere("Staff.personnal_number ILIKE :personnal_number", {
      personnal_number: `%${personnal_number}%`,
    });
  }

  if (fio) {
    queryBuilder.andWhere(
      `(Staff.ln || ' ' || substring(Staff.nm for 1) || '.' || CONCAT(substring(Staff.mn for 1) || '.')) ILIKE :fio`,
      {
        fio: `%${fio}%`,
      },
    );
  }

  if (unit) {
    queryBuilder.andWhere("emp.unit_id = :unit", { unit });
  }

  if (role) {
    queryBuilder.addCommonTableExpression(
      `
      SELECT "emp"."id"   AS "emp_id",
          array_agg("Roles"."id") AS "Roles_ids"
      FROM "sad"."emp" "emp"
            LEFT JOIN "sad"."post" "Post" ON "Post"."id" = "emp"."post_id"
            LEFT JOIN "sad"."emp_role" "emp_Roles" ON "emp_Roles"."emp_id" = "emp"."id"
            LEFT JOIN "sad"."roles" "Roles" ON "Roles"."id" = "emp_Roles"."role_id"
      GROUP BY "emp"."id"`,
      "s1",
    );
    queryBuilder.innerJoin("s1", "s", 'emp.id = "s"."emp_id"');
    queryBuilder.andWhere(':role = ANY("s"."Roles_ids")', { role });
  }

  if (db) {
    queryBuilder.andWhere("emp.db = :db", { db });
  }

  if (de) {
    queryBuilder.andWhere("emp.de = :de", { de });
  }

  getOrderAllEmp(queryBuilder, orderBy);
}

function getOrderAllEmp(queryBuilder: SelectQueryBuilder<EmpEntity>, orderBy: OrderEmpInput): void {
  if (!orderBy) {
    queryBuilder.orderBy("emp.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderEmpEnum.post:
      queryBuilder.orderBy("Post.nm", orderBy.sortEnum);
      break;
    case OrderEmpEnum.fio:
      queryBuilder.orderBy({
        "Staff.ln": orderBy.sortEnum,
        "Staff.nm": orderBy.sortEnum,
        "Staff.mn": orderBy.sortEnum,
      });
      break;
    case OrderEmpEnum.unit:
      queryBuilder.orderBy("Unit.nm", orderBy.sortEnum);
      break;
    case OrderEmpEnum.db:
      queryBuilder.orderBy("emp.db", orderBy.sortEnum);
      break;
    case OrderEmpEnum.de:
      queryBuilder.orderBy("emp.de", orderBy.sortEnum);
      break;
    case OrderEmpEnum.personnal_number:
      queryBuilder.orderBy("Staff.personnal_number", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("emp.id", SortEnum.DESC);
  }
}
