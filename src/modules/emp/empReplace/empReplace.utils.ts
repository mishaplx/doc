import { SelectQueryBuilder } from "typeorm";

import { OrderEmpReplaceEnum, SortEnum } from "../../../common/enum/enum";
import { EmpReplaceEntity } from "../../../entity/#organization/emp_replace/emp_replace.entity";
import { GetListEmpReplace } from "./dto/get-list-emp-replace";
import { OrderEmpReplaceInput } from "./dto/order-emp-replace-request.dto";

export function setQueryBuilderEmpReplace(
  args: GetListEmpReplace,
  orderBy: OrderEmpReplaceInput,
  queryBuilder: SelectQueryBuilder<EmpReplaceEntity>,
): void {
  const { post, emp_whom, emp_who, date_start, date_end } = args;

  queryBuilder.leftJoinAndSelect("emp_replace.Emp_whom", "Emp_whom");
  queryBuilder.leftJoinAndSelect("Emp_whom.User", "Em_User");
  queryBuilder.leftJoinAndSelect("Em_User.Staff", "Em_Staff");
  queryBuilder.leftJoinAndSelect("Emp_whom.post", "Em_post");
  queryBuilder.leftJoinAndSelect("emp_replace.Emp_who", "Emp_who");
  queryBuilder.leftJoinAndSelect("Emp_who.User", "E_User");
  queryBuilder.leftJoinAndSelect("E_User.Staff", "E_Staff");

  queryBuilder.where("emp_replace.del = false");
  queryBuilder.andWhere("emp_replace.temp = false");
  queryBuilder.andWhere("emp_replace.date_end::date >= CURRENT_DATE");

  if (post) {
    queryBuilder.andWhere("Emp_whom.post_id = :post", { post });
  }

  if (emp_whom) {
    queryBuilder.andWhere(
      `(Em_Staff.ln || ' ' || Em_Staff.nm || ' ' || CONCAT(Em_Staff.mn)) ILIKE :emp_whom`,
      {
        emp_whom: `%${emp_whom}%`,
      },
    );
  }

  if (emp_who) {
    queryBuilder.andWhere(
      `(E_Staff.ln || ' ' || E_Staff.nm || ' ' || CONCAT(E_Staff.mn)) ILIKE :emp_who`,
      {
        emp_who: `%${emp_who}%`,
      },
    );
  }

  if (date_start) {
    queryBuilder.andWhere("emp_replace.date_start::date = :date_start", {
      date_start,
    });
  }

  if (date_end) {
    queryBuilder.andWhere("emp_replace.date_end::date = :date_end", {
      date_end,
    });
  }

  getOrderAllEmpReplace(queryBuilder, orderBy);
}

function getOrderAllEmpReplace(
  queryBuilder: SelectQueryBuilder<EmpReplaceEntity>,
  orderBy: OrderEmpReplaceInput,
): void {
  if (!orderBy) {
    queryBuilder.orderBy("emp_replace.id", SortEnum.DESC);
    return;
  }

  switch (orderBy.value) {
    case OrderEmpReplaceEnum.post:
      queryBuilder.orderBy("Em_post.nm", orderBy.sortEnum);
      break;
    case OrderEmpReplaceEnum.emp_whom:
      queryBuilder.orderBy({
        "Em_Staff.ln": orderBy.sortEnum,
        "Em_Staff.nm": orderBy.sortEnum,
        "Em_Staff.mn": orderBy.sortEnum,
      });
      break;
    case OrderEmpReplaceEnum.emp_who:
      queryBuilder.orderBy({
        "E_Staff.ln": orderBy.sortEnum,
        "E_Staff.nm": orderBy.sortEnum,
        "E_Staff.mn": orderBy.sortEnum,
      });
      break;
    case OrderEmpReplaceEnum.date_start:
      queryBuilder.orderBy("emp_replace.date_start", orderBy.sortEnum);
      break;
    case OrderEmpReplaceEnum.date_end:
      queryBuilder.orderBy("emp_replace.date_end", orderBy.sortEnum);
      break;
    default:
      queryBuilder.orderBy("emp_replace.id", SortEnum.DESC);
  }
}
